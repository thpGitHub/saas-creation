'use client';
import { useEffect, useState } from 'react';
import PostList from '@/components/PostList';

export default function PublishedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const res = await fetch('/api/posts?all=1');
      const data = await res.json();
      setPosts(data);
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-cartoon-dark">Tous les posts publiés</h1>
      {isLoading ? (
        <div className="text-center py-8 animate-pulse">Chargement...</div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
} 