'use client';

import { useState } from 'react';

export default function PostLinkedInPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishDate: '',
    publishTime: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Combine date et heure pour créer un timestamp ISO
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
      } else {
        alert('Erreur lors de la programmation du post.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue.');
    }
  };

  // Obtenir la date et l'heure actuelles pour les valeurs minimales
  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  const minTime = now.toTimeString().slice(0, 5);

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
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
    </main>
  );
} 