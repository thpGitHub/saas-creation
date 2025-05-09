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
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-24 h-24 mb-6 mx-auto bg-cartoon-blue rounded-blob border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon-lg transform hover:rotate-3 transition-all duration-300">
          <span className="text-white font-bold text-4xl">SP</span>
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 text-cartoon-dark">
          Bienvenue sur <span className="text-cartoon-blue">Social</span><span className="text-cartoon-purple">Post</span>
        </h1>
        
        <p className="mb-8 text-lg text-gray-600 max-w-md mx-auto">
          Planifiez et publiez vos posts sur les réseaux sociaux facilement grâce à l'intelligence artificielle.
        </p>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="card p-6 hover:translate-y-[-5px]">
            <div className="w-12 h-12 mb-4 bg-cartoon-yellow/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-cartoon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-cartoon-dark">Planification</h3>
            <p className="text-gray-600">Programmez vos publications à l'avance pour maintenir une présence constante.</p>
          </div>
          
          <div className="card p-6 hover:translate-y-[-5px]">
            <div className="w-12 h-12 mb-4 bg-cartoon-purple/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-cartoon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-cartoon-dark">IA intégrée</h3>
            <p className="text-gray-600">Générez du contenu de qualité grâce à l'intelligence artificielle.</p>
          </div>
          
          <div className="card p-6 hover:translate-y-[-5px]">
            <div className="w-12 h-12 mb-4 bg-cartoon-blue/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-cartoon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-cartoon-dark">Analytics</h3>
            <p className="text-gray-600">Suivez l'engagement de vos publications sur les réseaux sociaux.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-cartoon-dark">Tableau de bord</h1>
        <div className="w-24 h-1 bg-cartoon-blue mx-auto rounded-full"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-cartoon-dark">Derniers posts publiés</h2>
            <button 
              onClick={handleRefresh} 
              className="flex items-center px-3 py-1 rounded-cartoon bg-white border border-cartoon-dark/20 text-cartoon-blue font-bold text-sm transition-all hover:shadow-cartoon-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              ) : (
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
            <div className="text-center py-8 animate-pulse">
              <div className="w-12 h-12 mx-auto bg-cartoon-bg/70 rounded-full mb-4 flex items-center justify-center">
                <svg className="animate-spin w-6 h-6 text-cartoon-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-cartoon-dark font-bold">Chargement des posts...</p>
            </div>
          ) : (
            <PostList posts={publishedPosts} />
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-cartoon-dark">Derniers posts planifiés</h2>
          <ScheduledPosts />
        </div>
      </div>
    </div>
  );
} 