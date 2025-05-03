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

// Définir le webhook à utiliser en fonction du réseau social
const MAKE_WEBHOOKS = {
  linkedin: process.env.MAKE_WEBHOOK_LINKEDIN_URL || process.env.MAKE_WEBHOOK_URL,
  twitter: process.env.MAKE_WEBHOOK_TWITTER_URL,
  facebook: process.env.MAKE_WEBHOOK_FACEBOOK_URL,
  instagram: process.env.MAKE_WEBHOOK_INSTAGRAM_URL
};

// Réseau par défaut
const DEFAULT_NETWORK = 'linkedin';

// Vérifier et ajouter la colonne has_image si elle n'existe pas
try {
  // Vérifier si la colonne existe déjà
  const columns = db.prepare("PRAGMA table_info(posts)").all();
  const hasImageExists = columns.some((col: any) => col.name === 'has_image');
  
  // Ajouter la colonne si elle n'existe pas
  if (!hasImageExists) {
    db.prepare("ALTER TABLE posts ADD COLUMN has_image INTEGER DEFAULT 0").run();
    console.log("Colonne has_image ajoutée à la table posts");
  }
} catch (error) {
  console.error("Erreur lors de la vérification/ajout de la colonne has_image:", error);
}

export async function POST(request: Request) {
  try {
    // Vérifier le type de contenu pour déterminer comment traiter la requête
    const contentType = request.headers.get('Content-Type') || '';
    
    let body: any = {};
    let imageFile = null;
    
    // Traiter les requêtes multipart (avec image)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extraire les données du formulaire
      body = {
        title: formData.get('title'),
        content: formData.get('content'),
        scheduledTime: formData.get('scheduledTime'),
        network: formData.get('network') || DEFAULT_NETWORK
      };
      
      // Récupérer l'image si présente
      imageFile = formData.get('image') as File;
    } else {
      // Traiter les requêtes JSON standard (sans image)
      body = await request.json();
    }
    
    // Récupérer l'utilisateur depuis le cookie
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
    
    // Déterminer le réseau social à utiliser
    const network = body.network || DEFAULT_NETWORK;
    
    // Vérifier si la publication est prévue maintenant ou dans le futur
    const scheduledTime = new Date(body.scheduledTime);
    const now = new Date();
    const isScheduledForLater = scheduledTime.getTime() > now.getTime() + 60000; // +1 minute pour éviter les problèmes de timing
    
    console.log('Publication:', {
      network,
      scheduledTime: scheduledTime.toISOString(),
      now: now.toISOString(),
      isScheduledForLater,
      delta: scheduledTime.getTime() - now.getTime(),
      timeString: body.scheduledTime,
      hasImage: !!imageFile
    });
    
    // Si planifié pour plus tard, utiliser le système de planification
    if (isScheduledForLater) {
      const postWithUser = {
        ...body,
        userId: user.id,
        network,
        hasImage: !!imageFile,
        // Stocker les métadonnées de l'image si disponible
        imageData: imageFile ? {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size
        } : null
      };
      
      console.log('Planification de post:', postWithUser);
      
      // Utiliser le scheduler pour les posts planifiés
      const postId = scheduler.schedulePost(postWithUser);
      
      // Si nous avons une image, stocker l'image temporairement pour une utilisation ultérieure
      if (imageFile) {
        // Conversion en ArrayBuffer pour stockage
        const arrayBuffer = await imageFile.arrayBuffer();
        
        // TODO: Stocker l'image avec le postId comme référence, par exemple dans une table images
        // ou dans un système de fichiers, et l'associer au postId
        
        console.log(`Image reçue pour post planifié: ${postId}, taille: ${arrayBuffer.byteLength} bytes`);
      }
      
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
      VALUES (?, ?, ?, ?, ?, 'published', ?)
    `).run(
      postId,
      user.id,
      body.title,
      body.content,
      nowIso,
      network
    );
    
    // On enregistre l'information sur l'image dans les logs pour débug
    if (imageFile) {
      console.log(`Post ${postId} publié avec image: ${imageFile.name}, ${imageFile.type}, ${imageFile.size} bytes`);
    }
    
    // Déterminer le webhook à utiliser
    const webhookUrl = MAKE_WEBHOOKS[network as keyof typeof MAKE_WEBHOOKS];
    
    if (!webhookUrl) {
      console.error(`Aucun webhook configuré pour le réseau ${network}`);
      return NextResponse.json({ error: `Publication sur ${network} non configurée` }, { status: 400 });
    }
    
    // Préparer les données à envoyer à Make
    let makeRequestOptions: RequestInit;
    
    if (imageFile) {
      // Pour les requêtes avec image, utiliser FormData pour Make
      const makeFormData = new FormData();
      makeFormData.append('postId', postId);
      makeFormData.append('title', body.title);
      makeFormData.append('content', body.content);
      makeFormData.append('network', network);
      makeFormData.append('image', imageFile);
      
      makeRequestOptions = {
        method: 'POST',
        body: makeFormData,
      };
    } else {
      // Pour les requêtes sans image, utiliser JSON
      makeRequestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          title: body.title,
          content: body.content,
          network: network
        }),
      };
    }
    
    // Envoyer à Make en parallèle (sans attendre de retour)
    fetch(webhookUrl, makeRequestOptions).catch(error => {
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