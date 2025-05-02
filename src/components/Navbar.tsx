'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">SocialPost</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/create" className="nav-link">
                  Créer un post
                </Link>
                <button onClick={logout} className="nav-link">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">
                  Connexion
                </Link>
                <Link href="/register" className="nav-link">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 