import { useState, useEffect } from 'react';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  scheduledTime: string;
}

export default function ScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editDateTime, setEditDateTime] = useState({ date: '', time: '' });

  useEffect(() => {
    loadScheduledPosts();
    const interval = setInterval(loadScheduledPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadScheduledPosts = async () => {
    try {
      console.log('Chargement des posts planifiés...');
      const response = await fetch('/api/send-to-make');
      if (response.ok) {
        const data = await response.json();
        console.log('Posts planifiés reçus:', data);
        setPosts(data);
      } else {
        console.error('Erreur HTTP:', response.status, response.statusText);
        const text = await response.text();
        console.error('Réponse:', text);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    try {
      const publishDateTime = new Date(`${editDateTime.date}T${editDateTime.time}`).toISOString();
      
      const response = await fetch('/api/send-to-make', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId,
          scheduledTime: publishDateTime 
        }),
      });

      if (response.ok) {
        setEditingPost(null);
        loadScheduledPosts();
      } else {
        alert('Erreur lors de la modification du post.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch('/api/send-to-make', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        loadScheduledPosts();
      } else {
        alert('Erreur lors de la suppression du post.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue.');
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun post planifié
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{post.title}</h3>
          </div>
          <p className="text-gray-600 mb-2">{post.content}</p>
          
          {editingPost === post.id ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={editDateTime.date}
                  onChange={(e) => setEditDateTime({ ...editDateTime, date: e.target.value })}
                  className="input"
                />
                <input
                  type="time"
                  value={editDateTime.time}
                  onChange={(e) => setEditDateTime({ ...editDateTime, time: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleUpdatePost(post.id)}
                  className="btn-secondary"
                >
                  Valider
                </button>
                <button
                  onClick={() => setEditingPost(null)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Prévu pour le {new Date(post.scheduledTime).toLocaleString('fr-FR')}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setEditingPost(post.id);
                    const date = new Date(post.scheduledTime);
                    setEditDateTime({
                      date: date.toISOString().split('T')[0],
                      time: date.toTimeString().slice(0, 5)
                    });
                  }}
                  className="btn-secondary"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="btn-danger"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 