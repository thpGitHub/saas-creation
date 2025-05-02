import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validation des données
    if (!email || !password || !name) {
      console.error('Données manquantes:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit faire au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    console.log('Vérification de l\'email:', email);
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      console.log('Email déjà utilisé');
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    console.log('Hashage du mot de passe');
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    // Insérer l'utilisateur
    console.log('Insertion de l\'utilisateur');
    try {
      db.prepare(`
        INSERT INTO users (id, email, name, password)
        VALUES (?, ?, ?, ?)
      `).run(userId, email, name, hashedPassword);
    } catch (dbError) {
      console.error('Erreur SQL:', dbError);
      throw dbError;
    }

    // Retourner les données de l'utilisateur (sans le mot de passe)
    const user = {
      id: userId,
      email,
      name,
    };

    console.log('Utilisateur créé avec succès:', { id: userId, email });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
} 