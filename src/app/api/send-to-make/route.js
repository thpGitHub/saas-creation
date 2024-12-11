export async function POST(req) {
    try {
      const { title, content, scheduledTime } = await req.json();
  
      const makeResponse = await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          content,
          scheduledTime,
        }),
      });
  
      if (makeResponse.ok) {
        return new Response(JSON.stringify({ message: 'Post programmé avec succès.' }), {
          status: 200,
        });
      } else {
        return new Response(JSON.stringify({ error: 'Erreur lors de la programmation.' }), {
          status: makeResponse.status,
        });
      }
    } catch (error) {
        console.log(error);
      return new Response(JSON.stringify({ error: 'Erreur serveur.' }), { status: 500 });
    }
  }
  