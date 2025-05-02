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
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-cartoon-dark">Créer un nouveau post</h1>
        <div className="w-24 h-1 bg-cartoon-blue mx-auto rounded-full"></div>
      </div>

      {error && (
        <div className="alert-error mb-6 animate-slide-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-cartoon shadow-md border border-cartoon-dark/20 p-8">
        <div className="form-group">
          <label htmlFor="title" className="label">
            Titre
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-cartoon-dark/20 rounded-cartoon 
            focus:ring-2 focus:ring-cartoon-blue/50 focus:border-cartoon-blue/30 outline-none
            transition-all duration-200 bg-white shadow-sm
            placeholder:text-gray-400"
            required
            disabled={isLoading}
            placeholder="Donnez un titre à votre post"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content" className="label">
            Contenu
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 border border-cartoon-dark/20 rounded-cartoon 
            focus:ring-2 focus:ring-cartoon-blue/50 focus:border-cartoon-blue/30 outline-none
            transition-all duration-200 bg-white shadow-sm min-h-[150px] resize-y
            placeholder:text-gray-400"
            required
            disabled={isLoading}
            placeholder="Décrivez le contenu que vous souhaitez générer..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="publishDate" className="label">
              Date de publication
            </label>
            <input
              type="date"
              id="publishDate"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              className="w-full px-4 py-3 border border-cartoon-dark/20 rounded-cartoon 
              focus:ring-2 focus:ring-cartoon-blue/50 focus:border-cartoon-blue/30 outline-none
              transition-all duration-200 bg-white shadow-sm
              placeholder:text-gray-400"
              min={minDate}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="publishTime" className="label">
              Heure de publication
            </label>
            <input
              type="time"
              id="publishTime"
              value={formData.publishTime}
              onChange={(e) => setFormData({ ...formData, publishTime: e.target.value })}
              className="w-full px-4 py-3 border border-cartoon-dark/20 rounded-cartoon 
              focus:ring-2 focus:ring-cartoon-blue/50 focus:border-cartoon-blue/30 outline-none
              transition-all duration-200 bg-white shadow-sm
              placeholder:text-gray-400"
              min={formData.publishDate === minDate ? minTime : undefined}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Options avancées */}
        <div className="border border-cartoon-dark/50 rounded-cartoon bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            className="flex justify-between items-center w-full p-4 text-left focus:outline-none bg-cartoon-bg/60"
            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          >
            <span className="font-bold text-cartoon-purple">Options avancées</span>
            <div className={`w-6 h-6 rounded-full bg-cartoon-purple flex items-center justify-center shadow-cartoon-button transition-transform duration-300 ${advancedOptionsOpen ? 'rotate-180' : ''}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </button>
          
          {advancedOptionsOpen && (
            <div className="p-6 border-t border-cartoon-dark/50 space-y-6 animate-slide-in">
              <div className="form-group">
                <label htmlFor="model" className="label">
                  Modèle d'IA
                </label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-3 border border-cartoon-dark/20 rounded-cartoon 
                  focus:ring-2 focus:ring-cartoon-blue/50 focus:border-cartoon-blue/30 outline-none
                  transition-all duration-200 bg-white shadow-sm
                  placeholder:text-gray-400"
                  disabled={isLoading}
                >
                  {GPT_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="maxTokens" className="label flex justify-between">
                  <span>Nombre maximum de tokens</span>
                  <span className="text-cartoon-blue font-bold">{formData.maxTokens}</span>
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="range"
                    id="maxTokens"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                    min="100"
                    max="2000"
                    step="50"
                    className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-cartoon-blue"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {preview && editedPreview ? (
          <div className="bg-cartoon-bg/50 border border-cartoon-dark/30 rounded-cartoon p-6 shadow-cartoon animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-cartoon-dark">Prévisualisation</h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-cartoon-purple hover:text-cartoon-blue font-bold transition-colors"
                >
                  {isEditing ? "Mode prévisualisation" : "Modifier le texte"}
                </button>
                {preview && preview._meta && (
                  <div className="text-xs bg-cartoon-blue text-white px-3 py-1 rounded-full">
                    {GPT_MODELS.find(m => m.id === preview?._meta?.model)?.name || preview?._meta?.model}
                  </div>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4 mb-4">
                <div className="form-group">
                  <label htmlFor="editTitle" className="label">
                    Titre
                  </label>
                  <input
                    type="text"
                    id="editTitle"
                    value={editedPreview.title}
                    onChange={(e) => setEditedPreview({...editedPreview, title: e.target.value})}
                    className="w-full px-4 py-3 border border-cartoon-dark/20 rounded-cartoon 
                    focus:ring-2 focus:ring-cartoon-blue/50 focus:border-cartoon-blue/30 outline-none
                    transition-all duration-200 bg-white shadow-sm
                    placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editContent" className="label">
                    Contenu
                  </label>
                  <textarea
                    id="editContent"
                    value={editedPreview.content}
                    onChange={(e) => setEditedPreview({...editedPreview, content: e.target.value})}
                    className="w-full px-4 py-3 border border-cartoon-dark/20 rounded-cartoon 
                    focus:ring-2 focus:ring-cartoon-blue/50 focus:border-cartoon-blue/30 outline-none
                    transition-all duration-200 bg-white shadow-sm min-h-[150px] resize-y
                    placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-cartoon shadow-cartoon-inner border border-cartoon-dark/30 mb-6">
                <h4 className="font-bold text-lg text-cartoon-dark mb-3">{editedPreview.title}</h4>
                <p className="whitespace-pre-wrap text-gray-700">{editedPreview.content}</p>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="btn-secondary"
                disabled={isLoading}
              >
                Annuler
              </button>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setEditedPreview(null);
                    setIsEditing(false);
                  }}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Modifier
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publication...
                    </span>
                  ) : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={handlePreview}
              className="btn-primary py-4 text-lg relative overflow-hidden group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Génération en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Prévisualiser
                </span>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="btn-secondary"
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