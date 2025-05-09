import scheduler from '@/services/scheduler';

export async function POST(req) {
  try {
    const post = await req.json();
    const postId = scheduler.schedulePost(post);

    return new Response(JSON.stringify({ 
      message: 'Post planifié avec succès',
      postId 
    }), {
      status: 200,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur serveur' 
    }), { 
      status: 500 
    });
  }
}

// Route pour voir les posts planifiés
export async function GET(req) {
  try {
    const url = req.url || '';
    const showAll = url.includes('all=1');
    const posts = scheduler.getScheduledPosts(showAll);
    return new Response(JSON.stringify(posts), {
      status: 200,
    });
  } catch (error) {
    console.error("API - Erreur récupération posts:", error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { 
      status: 500 
    });
  }
}

export async function DELETE(req) {
  try {
    const { postId } = await req.json();
    const success = scheduler.cancelPost(postId);

    if (success) {
      return new Response(JSON.stringify({ 
        message: 'Post supprimé avec succès'
      }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        error: 'Post non trouvé' 
      }), { 
        status: 404 
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur serveur' 
    }), { 
      status: 500 
    });
  }
}

export async function PATCH(req) {
  try {
    const { postId, scheduledTime } = await req.json();
    const success = scheduler.updatePost(postId, scheduledTime);

    if (success) {
      return new Response(JSON.stringify({ 
        message: 'Post modifié avec succès'
      }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        error: 'Post non trouvé' 
      }), { 
        status: 404 
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur serveur' 
    }), { 
      status: 500 
    });
  }
}
  