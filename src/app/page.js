'use client';

import { useState, useEffect } from 'react';

export default function PostLinkedInPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishDate: '',
    publishTime: '',
  });

  // État pour stocker la liste des posts planifiés
  const [scheduledPosts, setScheduledPosts] = useState([]);

  // Fonction pour charger les posts planifiés
  const loadScheduledPosts = async () => {
    try {
      const response = await fetch('/api/send-to-make');
      if (response.ok) {
        const posts = await response.json();
        setScheduledPosts(posts);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
    }
  };

  // Charger les posts au chargement de la page et toutes les 30 secondes
  useEffect(() => {
    loadScheduledPosts();
    const interval = setInterval(loadScheduledPosts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const publishDateTime = new Date(`${formData.publishDate}T${formData.publishTime}`).toISOString();

      const response = await fetch('/api/send-to-make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          scheduledTime: publishDateTime,
        }),
      });

      if (response.ok) {
        alert('Post programmé avec succès !');
        setFormData({ title: '', content: '', publishDate: '', publishTime: '' });
        // Recharger la liste des posts après l'ajout
        loadScheduledPosts();
      } else {
        alert('Erreur lors de la programmation du post.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue.');
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtenir la date et l'heure actuelles pour les valeurs minimales
  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  const minTime = now.toTimeString().slice(0, 5);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Formulaire */}
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Publier sur LinkedIn
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="title" className="label">
                Titre
              </label>
              <input
                id="title"
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content" className="label">
                Contenu
              </label>
              <textarea
                id="content"
                className="textarea"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="publishDate" className="label">
                  Date de publication
                </label>
                <input
                  id="publishDate"
                  type="date"
                  className="input"
                  min={minDate}
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="publishTime" className="label">
                  Heure de publication
                </label>
                <input
                  id="publishTime"
                  type="time"
                  className="input"
                  min={formData.publishDate === minDate ? minTime : undefined}
                  value={formData.publishTime}
                  onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">
              Programmer la publication
            </button>
          </form>
        </div>

        {/* Liste des posts planifiés */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Posts planifiés ({scheduledPosts.length})
          </h2>
          
          <div className="space-y-4">
            {scheduledPosts.length === 0 ? (
              <p className="text-gray-500">Aucun post planifié</p>
            ) : (
              scheduledPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Prévu pour le : {formatDate(post.scheduledTime)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 