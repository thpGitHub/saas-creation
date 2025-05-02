'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Liste des modèles disponibles
const GPT_MODELS = [
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Rapide et économique" },
  { id: "gpt-4", name: "GPT-4", description: "Plus avancé, meilleure qualité" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Version améliorée de GPT-4" }
];

// Type pour la prévisualisation
interface PreviewResponse {
  title: string;
  content: string;
  _meta?: {
    model: string;
    maxTokens: number;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    }
  }
}

export default function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPreview, setEditedPreview] = useState<{title: string, content: string} | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishDate: '',
    publishTime: '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500
  });

  // Obtenir la date et l'heure minimales (maintenant)
  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  const minTime = now.toTimeString().slice(0, 5);

  const handlePreview = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/send-to-make/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          model: formData.model,
          maxTokens: formData.maxTokens
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la prévisualisation');
      }

      setPreview(data);
      setEditedPreview({
        title: data.title,
        content: data.content
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !editedPreview) {
      setError('Veuillez d\'abord prévisualiser votre post');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const publishDateTime = new Date(`${formData.publishDate}T${formData.publishTime}`).toISOString();

      const response = await fetch('/api/send-to-make/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedPreview.title,
          content: editedPreview.content,
          scheduledTime: publishDateTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la publication');
      }

      // Si c'est une planification, rediriger immédiatement
      if (data.isScheduled) {
        router.push('/');
      } else {
        // Sinon, attendre un court instant pour la publication immédiate
        setTimeout(() => {
          router.push('/');
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Créer un nouveau post</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">
            Titre
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="content" className="block mb-1 font-medium text-gray-700">
            Contenu
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="publishDate" className="block mb-1 font-medium text-gray-700">
              Date de publication
            </label>
            <input
              type="date"
              id="publishDate"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={minDate}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="publishTime" className="block mb-1 font-medium text-gray-700">
              Heure de publication
            </label>
            <input
              type="time"
              id="publishTime"
              value={formData.publishTime}
              onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={formData.publishDate === minDate ? minTime : undefined}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Options avancées */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            className="flex justify-between items-center w-full p-3 text-left focus:outline-none"
            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          >
            <span className="font-medium text-blue-600">Options avancées</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${advancedOptionsOpen ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {advancedOptionsOpen && (
            <div className="p-4 border-t border-gray-200 space-y-4">
              <div>
                <label htmlFor="model" className="block mb-1 font-medium text-gray-700">
                  Modèle d'IA
                </label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {GPT_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="maxTokens" className="block mb-1 font-medium text-gray-700">
                  Nombre maximum de tokens (longueur de la réponse)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    id="maxTokens"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                    min="100"
                    max="2000"
                    step="50"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isLoading}
                  />
                  <span className="text-gray-700 w-16 text-center">{formData.maxTokens}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {preview && editedPreview ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Prévisualisation</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  {isEditing ? "Mode prévisualisation" : "Modifier le texte"}
                </button>
                {preview && preview._meta && (
                  <div className="text-xs text-gray-500">
                    Généré avec {GPT_MODELS.find(m => m.id === preview?._meta?.model)?.name || preview?._meta?.model}
                  </div>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 mb-4">
                <div>
                  <label htmlFor="editTitle" className="block mb-1 text-sm font-medium text-gray-700">
                    Titre
                  </label>
                  <input
                    type="text"
                    id="editTitle"
                    value={editedPreview.title}
                    onChange={(e) => setEditedPreview({...editedPreview, title: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="editContent" className="block mb-1 text-sm font-medium text-gray-700">
                    Contenu
                  </label>
                  <textarea
                    id="editContent"
                    value={editedPreview.content}
                    onChange={(e) => setEditedPreview({...editedPreview, content: e.target.value})}
                    className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border mb-4">
                <h4 className="font-semibold text-lg">{editedPreview.title}</h4>
                <p className="whitespace-pre-wrap mt-2 text-gray-700">{editedPreview.content}</p>
              </div>
            )}
            
            <div className="flex justify-between space-x-4">
              <div>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                >
                  Annuler
                </button>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setEditedPreview(null);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                >
                  Modifier
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Publication en cours...' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={handlePreview}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Génération en cours...' : 'Prévisualiser'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
          </div>
        )}
      </form>
    </div>
  );
} 