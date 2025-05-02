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
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-cartoon-dark rounded-cartoon p-8 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 bg-cartoon-bg rounded-full border-2 border-cartoon-dark flex items-center justify-center shadow-cartoon">
            <span className="text-cartoon-dark text-2xl font-bold">⏰</span>
          </div>
          <p className="text-cartoon-dark font-bold">Aucun post planifié</p>
          <p className="text-sm text-gray-500 mt-2">Planifiez vos posts pour automatiser votre présence</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div 
          key={post.id} 
          className={`post-card hover:translate-y-[-2px] transition-all duration-300 ${index % 3 === 0 ? '-rotate-1' : index % 3 === 1 ? 'rotate-1' : 'rotate-0'}`}
        >
          <div className="post-header">
            <h3 className="post-title">{post.title}</h3>
            <span className="badge-scheduled">Planifié</span>
          </div>
          <p className="post-content whitespace-pre-wrap">{post.content}</p>
          
          {editingPost === post.id ? (
            <div className="edit-form mt-4 rounded-cartoon animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editDate" className="label">Date</label>
                  <input
                    type="date"
                    id="editDate"
                    value={editDateTime.date}
                    onChange={(e) => setEditDateTime({ ...editDateTime, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="editTime" className="label">Heure</label>
                  <input
                    type="time"
                    id="editTime"
                    value={editDateTime.time}
                    onChange={(e) => setEditDateTime({ ...editDateTime, time: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => handleUpdatePost(post.id)}
                  className="btn-primary text-sm py-2 px-4"
                >
                  Valider
                </button>
                <button
                  onClick={() => setEditingPost(null)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-cartoon-blue font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="btn-danger text-xs py-1.5 px-3"
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