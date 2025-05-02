import { NextResponse } from 'next/server';
import db from '@/lib/db';

interface CallbackBody {
  postId: string;
  status: 'published' | 'failed';
  publishedUrl?: string;
}

export async function POST(request: Request) {
  try {
    const body: CallbackBody = await request.json();

    if (!body.postId) {
      return NextResponse.json(
        { error: "ID du post manquant" },
        { status: 400 }
      );
    }

    // Met à jour le statut du post et la date de publication
    const now = new Date().toISOString();
    
    const result = db.prepare(`
      UPDATE posts
      SET status = ?,
          published_at = ?
      WHERE id = ?
    `).run(
      body.status,
      now,
      body.postId
    );
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Post non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Post ${body.status === 'published' ? 'publié' : 'échoué'} avec succès`,
      postId: body.postId
    });
  } catch (error) {
    console.error('Erreur mise à jour post:', error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
} 