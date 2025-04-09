class PostScheduler {
  constructor() {
    this.scheduledPosts = new Map();
  }

  schedulePost(post) {
    const scheduledTime = new Date(post.scheduledTime).getTime();
    const now = new Date().getTime();
    const delay = scheduledTime - now;

    if (delay < 0) {
      throw new Error('La date de publication ne peut pas être dans le passé');
    }

    const postId = Date.now().toString();
    
    this.scheduledPosts.set(postId, {
      ...post,
      timer: setTimeout(async () => {
        await this.sendToMake(post);
        this.scheduledPosts.delete(postId);
      }, delay)
    });

    return postId;
  }

  async sendToMake(post) {
    try {
      const response = await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: post.title,
          content: post.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi à Make');
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi à Make:', error);
      return false;
    }
  }

  getScheduledPosts() {
    return Array.from(this.scheduledPosts.entries()).map(([id, post]) => ({
      id,
      title: post.title,
      content: post.content,
      scheduledTime: post.scheduledTime,
    }));
  }

  cancelPost(postId) {
    const post = this.scheduledPosts.get(postId);
    if (post) {
      clearTimeout(post.timer);
      this.scheduledPosts.delete(postId);
      return true;
    }
    return false;
  }

  updatePost(postId, newScheduledTime) {
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

    // Mettre à jour le post avec le nouveau timer
    this.scheduledPosts.set(postId, {
      ...post,
      scheduledTime: newScheduledTime,
      timer: setTimeout(async () => {
        await this.sendToMake(post);
        this.scheduledPosts.delete(postId);
      }, delay)
    });

    return true;
  }
}

const scheduler = new PostScheduler();
export default scheduler; 