'use client';

import { useEffect } from 'react';
import ScheduledPosts from '@/components/ScheduledPosts';

export default function ScheduledPostsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cartoon-dark">Tous les posts planifiés</h1>
        <button 
          onClick={() => {
            const event = new CustomEvent('refresh-scheduled-posts');
            window.dispatchEvent(event);
          }}
          className="flex items-center px-3 py-1 rounded-cartoon bg-white border border-cartoon-dark/20 text-cartoon-blue font-bold text-sm transition-all hover:shadow-cartoon-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
            <path d="M3 22v-6h6"></path>
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
          </svg>
          Rafraîchir
        </button>
      </div>
      <ScheduledPosts all={true} />
    </div>
  );
} 