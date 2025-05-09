import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import { compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur par email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;
    
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    // Vérifier le mot de passe
    const passwordMatch = await compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    // Créer la table login_history si elle n'existe pas
    db.exec(`
      CREATE TABLE IF NOT EXISTS login_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        login_time DATETIME NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    
    // Enregistrer l'historique de connexion
    db.prepare(`
      INSERT INTO login_history (id, user_id, login_time, ip_address, user_agent)
      VALUES (?, ?, datetime('now'), ?, ?)
    `).run(
      uuidv4(),
      user.id,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );
    
    // Préparer les données utilisateur pour le cookie (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;
    
    // Définir un cookie avec les informations de l'utilisateur
    const response = NextResponse.json(userWithoutPassword);
    
    response.cookies.set({
      name: 'user',
      value: JSON.stringify(userWithoutPassword),
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semaine
    });
    
    return response;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
} 