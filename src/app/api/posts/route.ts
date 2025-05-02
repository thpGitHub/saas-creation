import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const posts = db.prepare(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.published_at as publishedAt,
        p.network,
        u.name as author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published'
      ORDER BY p.published_at DESC
      LIMIT 20
    `).all();

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des posts' },
      { status: 500 }
    );
  }
} 