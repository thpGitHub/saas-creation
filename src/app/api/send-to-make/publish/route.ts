import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import scheduler from '@/services/scheduler';

interface User {
  id: string;
  email: string;
  name: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Récupérer l'utilisateur depuis le cookie
    const cookieStore = cookies();
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
    
    // Vérifier si la publication est prévue maintenant ou dans le futur
    const scheduledTime = new Date(body.scheduledTime);
    const now = new Date();
    const isScheduledForLater = scheduledTime.getTime() > now.getTime() + 60000; // +1 minute pour éviter les problèmes de timing
    
    console.log('Publication:', {
      scheduledTime: scheduledTime.toISOString(),
      now: now.toISOString(),
      isScheduledForLater,
      delta: scheduledTime.getTime() - now.getTime(),
      timeString: body.scheduledTime
    });
    
    // Si planifié pour plus tard, utiliser le système de planification
    if (isScheduledForLater) {
      const postWithUser = {
        ...body,
        userId: user.id
      };
      
      console.log('Planification de post:', postWithUser);
      
      // Utiliser le scheduler pour les posts planifiés
      const postId = scheduler.schedulePost(postWithUser);
      
      console.log('Post planifié:', postId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Post planifié avec succès',
        postId,
        isScheduled: true
      });
    }
    
    // Sinon, publication immédiate
    const postId = uuidv4();
    const nowIso = now.toISOString();
    
    // Enregistrer directement le post comme publié dans la base de données
    db.prepare(`
      INSERT INTO posts (id, user_id, title, content, published_at, status, network)
      VALUES (?, ?, ?, ?, ?, 'published', 'linkedin')
    `).run(
      postId,
      user.id,
      body.title,
      body.content,
      nowIso
    );
    
    // Envoyer à Make en parallèle (sans attendre de retour)
    fetch(process.env.MAKE_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: postId,
        title: body.title,
        content: body.content
      }),
    }).catch(error => {
      console.error('Erreur lors de l\'envoi à Make:', error);
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Post publié avec succès',
      postId,
      isScheduled: false
    });
  } catch (error) {
    console.error('Erreur publication:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la publication' },
      { status: 500 }
    );
  }
} 