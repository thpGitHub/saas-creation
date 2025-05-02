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
  }, []);

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
          <h2 className="text-xl font-semibold mb-4">Posts publiés</h2>
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