'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import PostList from '@/components/PostList';
import ScheduledPosts from '@/components/ScheduledPosts';

export default function HomePage() {
  const { user } = useAuth();
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data = await response.json();
          setPublishedPosts(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data = await response.json();
          setPublishedPosts(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-6">
          Bienvenue sur SocialPost
        </h1>
        <p className="mb-8 text-gray-600">
          Planifiez et publiez vos posts sur LinkedIn facilement.
        </p>
        <div className="space-x-4">
          <Link href="/login" className="btn-primary">
            Se connecter
          </Link>
          <Link href="/register" className="btn-secondary">
            S'inscrire
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Link href="/create" className="btn-primary">
          Créer un post
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Posts publiés</h2>
            <button 
              onClick={handleRefresh} 
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? 'Chargement...' : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                  </svg>
                  Rafraîchir
                </>
              )}
            </button>
          </div>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <PostList posts={publishedPosts} />
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Posts planifiés</h2>
          <ScheduledPosts />
        </div>
      </div>
    </div>
  );
} 