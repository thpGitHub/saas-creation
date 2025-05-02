import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

class PostScheduler {
  constructor() {
    this.scheduledPosts = new Map();
    this.loadPostsFromDB();
  }

  // Charger les posts programmés depuis la DB au démarrage
  loadPostsFromDB() {
    try {
      const posts = db.prepare(`
        SELECT id, user_id, title, content, scheduled_time, status 
        FROM posts 
        WHERE status = 'scheduled' AND scheduled_time >= datetime('now')
      `).all();
      
      posts.forEach(post => {
        const scheduledTime = new Date(post.scheduled_time).getTime();
        const now = new Date().getTime();
        const delay = scheduledTime - now;
        
        if (delay > 0) {
          this.scheduledPosts.set(post.id, {
            id: post.id,
            userId: post.user_id,
            title: post.title,
            content: post.content,
            scheduledTime: post.scheduled_time,
            timer: setTimeout(async () => {
              await this.sendToMake({
                id: post.id,
                title: post.title,
                content: post.content
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

      console.log('Scheduler - schedulePost - input:', {
        post,
        scheduledTime: new Date(post.scheduledTime).toISOString(),
        now: new Date(now).toISOString(),
        delay
      });

      if (delay < 0) {
        throw new Error('La date de publication ne peut pas être dans le passé');
      }

      // Générer un UUID pour le post
      const postId = uuidv4();
      
      console.log('Scheduler - insertion en BDD...', postId);
      
      // Insérer le post dans la base de données
      db.prepare(`
        INSERT INTO posts (id, user_id, title, content, scheduled_time, status)
        VALUES (?, ?, ?, ?, ?, 'scheduled')
      `).run(
        postId,
        post.userId, // Il faut s'assurer que le userId est passé dans le post
        post.title,
        post.content,
        post.scheduledTime
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
            content: post.content
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
      
      const response = await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id, // Envoyer l'ID pour le callback
          title: post.title,
          content: post.content,
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
        SELECT id, title, content, scheduled_time as scheduledTime 
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
            content: post.content
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