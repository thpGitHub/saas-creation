import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import scheduler from '@/services/scheduler';

interface Post {
  id: string;
  title: string;
  content: string;
  scheduledTime: string;
  network?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

export async function GET(request: Request) {
  try {
    // Récupérer tous les cookies
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    let user: User;
    try {
      user = JSON.parse(userCookie);
    } catch (error) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }
    
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 });
    }

    // D'abord, mettre à jour tous les posts passés
    db.prepare(`
      UPDATE posts 
      SET status = 'failed'
      WHERE status = 'scheduled' 
      AND scheduled_time < datetime('now')
    `).run();

    // Récupérer les posts programmés
    const posts = db.prepare(`
      SELECT id, title, content, scheduled_time as scheduledTime, network 
      FROM posts 
      WHERE user_id = ? 
      AND status = 'scheduled' 
      AND datetime(scheduled_time) > datetime('now')
      ORDER BY scheduled_time ASC
    `).all(user.id) as unknown as Post[];

    // Formater les dates pour JSON
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      scheduledTime: new Date(post.scheduledTime).toISOString(),
      network: post.network || 'social'
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts programmés:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des posts programmés' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { postId, scheduledTime } = await request.json();
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Vérifier que le post appartient à l'utilisateur
    const user = JSON.parse(userCookie);
    const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(postId, user.id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }
    
    const success = scheduler.updatePost(postId, scheduledTime);

    if (success) {
      return NextResponse.json({ 
        message: 'Post modifié avec succès'
      });
    } else {
      return NextResponse.json({ 
        error: 'Post non trouvé' 
      }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { postId } = await request.json();
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Vérifier que le post appartient à l'utilisateur
    const user = JSON.parse(userCookie);
    const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(postId, user.id);
    
    if (!post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }
    
    const success = scheduler.cancelPost(postId);

    if (success) {
      return NextResponse.json({ 
        message: 'Post supprimé avec succès'
      });
    } else {
      return NextResponse.json({ 
        error: 'Post non trouvé' 
      }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
} 