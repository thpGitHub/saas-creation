import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Définir le webhook à utiliser en fonction du réseau social
const MAKE_WEBHOOKS = {
  linkedin: process.env.MAKE_WEBHOOK_LINKEDIN_URL || process.env.MAKE_WEBHOOK_URL,
  twitter: process.env.MAKE_WEBHOOK_TWITTER_URL,
  facebook: process.env.MAKE_WEBHOOK_FACEBOOK_URL,
  instagram: process.env.MAKE_WEBHOOK_INSTAGRAM_URL
};

// Réseau par défaut
const DEFAULT_NETWORK = 'linkedin';

class PostScheduler {
  constructor() {
    this.scheduledPosts = new Map();
    this.loadPostsFromDB();
  }

  // Charger les posts programmés depuis la DB au démarrage
  loadPostsFromDB() {
    try {
      const posts = db.prepare(`
        SELECT id, user_id, title, content, scheduled_time, status, network 
        FROM posts 
        WHERE status = 'scheduled' AND scheduled_time >= datetime('now')
      `).all();
      
      posts.forEach(post => {
        const scheduledTime = new Date(post.scheduled_time).getTime();
        const now = new Date().getTime();
        const delay = scheduledTime - now;
        const network = post.network || DEFAULT_NETWORK;
        
        if (delay > 0) {
          this.scheduledPosts.set(post.id, {
            id: post.id,
            userId: post.user_id,
            title: post.title,
            content: post.content,
            scheduledTime: post.scheduled_time,
            network: network,
            timer: setTimeout(async () => {
              await this.sendToMake({
                id: post.id,
                title: post.title,
                content: post.content,
                network: network
              });
              this.scheduledPosts.delete(post.id);
            }, delay)
          });
        }
      });
      
      console.log(`${this.scheduledPosts.size} posts chargés depuis la base de données`);
    } catch (error) {
      console.error('Erreur lors du chargement des posts programmés:', error);
    }
  }

  schedulePost(post) {
    try {
      const scheduledTime = new Date(post.scheduledTime).getTime();
      const now = new Date().getTime();
      const delay = scheduledTime - now;
      const network = post.network || DEFAULT_NETWORK;

      console.log('Scheduler - schedulePost - input:', {
        post,
        scheduledTime: new Date(post.scheduledTime).toISOString(),
        now: new Date(now).toISOString(),
        delay,
        network
      });

      if (delay < 0) {
        throw new Error('La date de publication ne peut pas être dans le passé');
      }

      // Générer un UUID pour le post
      const postId = uuidv4();
      
      console.log('Scheduler - insertion en BDD...', postId);
      
      // Insérer le post dans la base de données
      db.prepare(`
        INSERT INTO posts (id, user_id, title, content, scheduled_time, status, network)
        VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
      `).run(
        postId,
        post.userId, // Il faut s'assurer que le userId est passé dans le post
        post.title,
        post.content,
        post.scheduledTime,
        network
      );
      
      console.log('Scheduler - post inséré en BDD, programmation du timer...');
      
      // Programmer le post en mémoire
      this.scheduledPosts.set(postId, {
        ...post,
        id: postId,
        timer: setTimeout(async () => {
          await this.sendToMake({
            id: postId,
            title: post.title,
            content: post.content,
            network: network
          });
          this.scheduledPosts.delete(postId);
        }, delay)
      });

      console.log('Scheduler - post planifié avec succès:', postId);
      return postId;
    } catch (error) {
      console.error('Erreur lors de la programmation du post:', error);
      throw error;
    }
  }

  async sendToMake(post) {
    try {
      // Mise à jour du statut à 'sending'
      db.prepare(`UPDATE posts SET status = 'sending' WHERE id = ?`).run(post.id);
      
      // Déterminer le webhook à utiliser
      const network = post.network || DEFAULT_NETWORK;
      const webhookUrl = MAKE_WEBHOOKS[network] || process.env.MAKE_WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.error(`Aucun webhook configuré pour le réseau ${network}`);
        db.prepare(`UPDATE posts SET status = 'failed', error = ? WHERE id = ?`).run(
          `Publication sur ${network} non configurée`,
          post.id
        );
        return false;
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id, // Envoyer l'ID pour le callback
          title: post.title,
          content: post.content,
          network: network
        }),
      });

      if (!response.ok) {
        // Marquer comme échoué dans la BD
        db.prepare(`UPDATE posts SET status = 'failed' WHERE id = ?`).run(post.id);
        throw new Error('Erreur lors de l\'envoi à Make');
      }
      
      // Note: On ne met pas à jour le statut à 'published' ici
      // Ce sera fait par le callback de Make
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi à Make:', error);
      return false;
    }
  }

  getScheduledPosts() {
    // Récupérer depuis la base de données pour avoir les données les plus récentes
    try {
      console.log('Scheduler - récupération des posts planifiés...');
      const posts = db.prepare(`
        SELECT id, title, content, scheduled_time as scheduledTime, network 
        FROM posts 
        WHERE status = 'scheduled' AND scheduled_time >= datetime('now') 
        ORDER BY scheduled_time ASC
      `).all();
      
      console.log('Scheduler - posts planifiés trouvés:', posts.length);
      
      return posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        scheduledTime: post.scheduledTime,
        network: post.network || DEFAULT_NETWORK
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des posts programmés:', error);
      return [];
    }
  }

  cancelPost(postId) {
    const post = this.scheduledPosts.get(postId);
    if (post) {
      clearTimeout(post.timer);
      this.scheduledPosts.delete(postId);
      
      // Mettre à jour le statut dans la BD
      try {
        db.prepare(`DELETE FROM posts WHERE id = ?`).run(postId);
        return true;
      } catch (error) {
        console.error('Erreur lors de la suppression du post:', error);
        return false;
      }
    }
    return false;
  }

  updatePost(postId, newScheduledTime) {
    try {
      const post = this.scheduledPosts.get(postId);
      if (!post) return false;

      // Annuler le timer existant
      clearTimeout(post.timer);

      // Calculer le nouveau délai
      const scheduledTime = new Date(newScheduledTime).getTime();
      const now = new Date().getTime();
      const delay = scheduledTime - now;

      if (delay < 0) {
        throw new Error('La date de publication ne peut pas être dans le passé');
      }

      // Mettre à jour dans la BD
      db.prepare(`UPDATE posts SET scheduled_time = ? WHERE id = ?`).run(
        newScheduledTime,
        postId
      );
      
      // Mettre à jour le post avec le nouveau timer
      this.scheduledPosts.set(postId, {
        ...post,
        scheduledTime: newScheduledTime,
        timer: setTimeout(async () => {
          await this.sendToMake({
            id: postId,
            title: post.title,
            content: post.content,
            network: post.network || DEFAULT_NETWORK
          });
          this.scheduledPosts.delete(postId);
        }, delay)
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du post:', error);
      return false;
    }
  }
}

const scheduler = new PostScheduler();
export default scheduler; 