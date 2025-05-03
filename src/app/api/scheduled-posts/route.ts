import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

interface Post {
  id: string;
  title: string;
  content: string;
  scheduledTime: string;
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

    // Récupérer les posts programmés
    const posts = db.prepare(`
      SELECT id, title, content, scheduled_time as scheduledTime 
      FROM posts 
      WHERE user_id = ? AND status = 'scheduled' AND scheduled_time >= datetime('now') 
      ORDER BY scheduled_time ASC
    `).all(user.id) as unknown as Post[];

    // Formater les dates pour JSON
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      scheduledTime: new Date(post.scheduledTime).toISOString()
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