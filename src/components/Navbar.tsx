'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white border-b-2 border-cartoon-dark shadow-cartoon-button py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            {/* Logo Cartoon */}
            <div className="w-10 h-10 rounded-full bg-cartoon-blue border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon-button group-hover:shadow-none group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
              <span className="text-white font-bold text-xl">SP</span>
            </div>
            <span className="text-xl font-extrabold text-cartoon-dark group-hover:text-cartoon-blue transition-colors">
              Social<span className="text-cartoon-blue group-hover:text-cartoon-dark">Post</span>
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/create" className="nav-link hover:animate-wiggle">
                  <span className="relative">
                    Créer un post
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-cartoon-pink rounded-full animate-pulse"></span>
                  </span>
                </Link>
                <button 
                  onClick={logout} 
                  className="nav-link hover:animate-wiggle"
                >
                  Déconnexion
                </button>
                <div className="w-8 h-8 rounded-full bg-cartoon-purple border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon-button">
                  <span className="text-white font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-link">
                  Connexion
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
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