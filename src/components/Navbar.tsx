'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const isCreatePage = pathname === '/create';
  const isHomePage = pathname === '/';

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effet pour gérer le scroll quand le menu est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

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
          <Link href="/" className="flex items-center space-x-2 group z-20">
            {/* Logo Cartoon */}
            <div className="w-10 h-10 rounded-full bg-cartoon-blue border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon-button group-hover:shadow-none group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
              <span className="text-white font-bold text-xl">SP</span>
            </div>
            <span className="text-xl font-extrabold text-cartoon-dark group-hover:text-cartoon-blue transition-colors">
              Social<span className="text-cartoon-blue group-hover:text-cartoon-dark">Post</span>
            </span>
          </Link>

          {/* Menu Burger pour mobile */}
          <button 
            className="lg:hidden z-20 relative w-12 h-12 flex flex-col justify-center items-center group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`w-8 h-8 bg-white rounded-cartoon border-2 border-cartoon-dark shadow-cartoon-button overflow-hidden ${isMenuOpen ? 'rotate-45' : ''} transition-transform duration-300`}>
              <div className="w-full h-full flex flex-col justify-center items-center relative">
                <span className={`block w-5 h-0.5 bg-cartoon-dark rounded-full transition-all duration-300 absolute ${isMenuOpen ? 'rotate-0' : '-translate-y-1.5'}`}></span>
                <span className={`block w-5 h-0.5 bg-cartoon-dark rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-5 h-0.5 bg-cartoon-dark rounded-full transition-all duration-300 absolute ${isMenuOpen ? 'rotate-90' : 'translate-y-1.5'}`}></span>
              </div>
            </div>
          </button>

          {/* Menu pour desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            {user ? (
              <>
                {isCreatePage ? (
                  <Link href="/" className="nav-link hover:animate-wiggle">
                    <span className="relative">
                      Accueil
                    </span>
                  </Link>
                ) : (
                  <Link href="/create" className="nav-link hover:animate-wiggle">
                    <span className="relative">
                      Créer un post
                    </span>
                  </Link>
                )}
                <Link href="/published-posts" className="nav-link hover:animate-wiggle">Posts publiés</Link>
                <Link href="/scheduled-posts" className="nav-link hover:animate-wiggle">Posts planifiés</Link>
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

      {/* Menu mobile en overlay */}
      <div 
        className={`fixed inset-0 bg-cartoon-dark/80 backdrop-blur-sm flex items-center justify-center transition-all duration-500 z-10 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className="bg-white p-8 rounded-cartoon border-2 border-cartoon-dark shadow-cartoon-lg w-11/12 max-w-sm transform transition-all duration-300 animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col space-y-6">
            {user ? (
              <>
                <div className="flex items-center space-x-3 pb-4 border-b border-cartoon-dark/20">
                  <div className="w-10 h-10 rounded-full bg-cartoon-purple border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon-button">
                    <span className="text-white font-bold text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-cartoon-dark font-bold">{user.name || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                {isCreatePage ? (
                  <Link 
                    href="/" 
                    className="flex items-center py-3 px-4 rounded-cartoon border border-cartoon-dark/20 hover:bg-cartoon-bg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-cartoon-green/10 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-cartoon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                    </div>
                    <span className="text-cartoon-dark font-bold">Accueil</span>
                  </Link>
                ) : (
                  <Link 
                    href="/create" 
                    className="flex items-center py-3 px-4 rounded-cartoon border border-cartoon-dark/20 hover:bg-cartoon-bg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-cartoon-blue/10 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-cartoon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                    <span className="text-cartoon-dark font-bold">Créer un post</span>
                  </Link>
                )}
                
                <Link href="/published-posts" className="flex items-center py-3 px-4 rounded-cartoon border border-cartoon-dark/20 hover:bg-cartoon-bg transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-full bg-cartoon-green/10 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-cartoon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-cartoon-dark font-bold">Posts publiés</span>
                </Link>
                <Link href="/scheduled-posts" className="flex items-center py-3 px-4 rounded-cartoon border border-cartoon-dark/20 hover:bg-cartoon-bg transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-full bg-cartoon-yellow/10 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-cartoon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-cartoon-dark font-bold">Posts planifiés</span>
                </Link>
                
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center py-3 px-4 rounded-cartoon border border-cartoon-dark/20 hover:bg-cartoon-bg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-cartoon-red/10 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-cartoon-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                  </div>
                  <span className="text-cartoon-dark font-bold">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="flex items-center py-3 px-4 rounded-cartoon border border-cartoon-dark/20 hover:bg-cartoon-bg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-cartoon-blue/10 flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-cartoon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                  </div>
                  <span className="text-cartoon-dark font-bold">Connexion</span>
                </Link>
                
                <Link 
                  href="/register" 
                  className="btn-primary py-3 px-4 flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
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