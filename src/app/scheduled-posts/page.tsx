import { useEffect, useState } from 'react';
import ScheduledPosts from '@/components/ScheduledPosts';

export default function ScheduledPostsPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-cartoon-dark">Tous les posts planifiés</h1>
      <ScheduledPosts all={true} />
    </div>
  );
} 