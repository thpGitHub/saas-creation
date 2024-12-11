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
export async function GET() {
  try {
    const posts = scheduler.getScheduledPosts();
    return new Response(JSON.stringify(posts), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { 
      status: 500 
    });
  }
}
  