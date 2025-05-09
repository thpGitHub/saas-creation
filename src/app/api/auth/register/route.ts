import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 10);
    
    // Générer un ID unique pour l'utilisateur
    const userId = uuidv4();
    
    // Insérer le nouvel utilisateur dans la base de données
    db.prepare(
      'INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)'
    ).run(userId, email, name, hashedPassword);

    // Récupérer l'utilisateur créé (sans le mot de passe)
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(userId);
    
    // Créer la réponse avec le cookie
    const response = NextResponse.json(user);
    
    response.cookies.set({
      name: 'user',
      value: JSON.stringify(user),
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
    });
    
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
} 