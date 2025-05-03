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

// Liste des réseaux sociaux disponibles
const SOCIAL_NETWORKS = [
  { 
    id: "linkedin", 
    name: "LinkedIn", 
    icon: "/icons/linkedin.svg", 
    color: "#0077B5", 
    bgColor: "#E8F4F9",
    description: "Professionnel" 
  },
  { 
    id: "twitter", 
    name: "Twitter/X", 
    icon: "/icons/twitter.svg", 
    color: "#1DA1F2", 
    bgColor: "#E8F6FD",
    description: "Court et concis" 
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: "/icons/facebook.svg", 
    color: "#1877F2", 
    bgColor: "#E9F2FF",
    description: "Engagement social" 
  },
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: "/icons/instagram.svg", 
    color: "#E1306C", 
    bgColor: "#FCEEF4",
    description: "Visuel et tendance" 
  }
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

// Pour l'upload d'image (uniquement LinkedIn)
interface UploadedImage {
  file: File;
  preview: string;
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
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishDate: '',
    publishTime: '',
    model: 'gpt-3.5-turbo',
    maxTokens: 500,
    network: 'linkedin'
  });

  // Obtenir la date et l'heure minimales (maintenant)
  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  const minTime = now.toTimeString().slice(0, 5);

  // Trouver le réseau social sélectionné
  const selectedNetwork = SOCIAL_NETWORKS.find(network => network.id === formData.network) || SOCIAL_NETWORKS[0];

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
          maxTokens: formData.maxTokens,
          network: formData.network
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

  // Gérer l'upload d'image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Format d\'image non supporté. Utilisez JPG, PNG ou GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        file,
        preview: reader.result as string
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      if (selectedImage && formData.network === 'linkedin') {
        const formDataObj = new FormData();
        formDataObj.append('title', editedPreview.title);
        formDataObj.append('content', editedPreview.content);
        formDataObj.append('scheduledTime', publishDateTime);
        formDataObj.append('network', formData.network);
        formDataObj.append('image', selectedImage.file);
        const response = await fetch('/api/send-to-make/publish', {
          method: 'POST',
          body: formDataObj,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la publication');
        }
        if (data.isScheduled) {
          router.push('/');
        } else {
          setTimeout(() => {
            router.push('/');
          }, 500);
        }
      } else {
        const response = await fetch('/api/send-to-make/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: editedPreview.title,
            content: editedPreview.content,
            scheduledTime: publishDateTime,
            network: formData.network
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la publication');
        }
        if (data.isScheduled) {
          router.push('/');
        } else {
          setTimeout(() => {
            router.push('/');
          }, 500);
        }
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
        {/* Sélecteur de réseau social */}
        <div className="form-group">
          <label className="label mb-3">Réseau social</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SOCIAL_NETWORKS.map(network => (
              <div 
                key={network.id}
                onClick={() => setFormData({ ...formData, network: network.id })}
                className={`cursor-pointer rounded-cartoon border-2 transition-all p-4 flex flex-col items-center hover:shadow-cartoon-button ${
                  formData.network === network.id 
                    ? `border-${network.color} bg-${network.bgColor} shadow-cartoon-button` 
                    : 'border-cartoon-dark/10 hover:border-cartoon-dark/30'
                }`}
              >
                <div 
                  className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center transition-transform ${
                    formData.network === network.id ? 'scale-110' : ''
                  }`}
                  style={{ backgroundColor: network.bgColor, color: network.color }}
                >
                  <div className="text-2xl font-bold">
                    {network.id === 'linkedin' && 'in'}
                    {network.id === 'twitter' && 'X'}
                    {network.id === 'facebook' && 'f'}
                    {network.id === 'instagram' && 'Ig'}
                  </div>
                </div>
                <span className={`font-bold text-sm ${formData.network === network.id ? `text-${network.color}` : 'text-cartoon-dark'}`}>
                  {network.name}
                </span>
                <span className="text-xs text-gray-500 mt-1">{network.description}</span>
              </div>
            ))}
          </div>
        </div>

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
          <div className="relative">
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
              placeholder={`Décrivez le contenu que vous souhaitez générer pour ${selectedNetwork.name}...`}
            />
            <div 
              className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: selectedNetwork.bgColor, color: selectedNetwork.color }}
            >
              {selectedNetwork.name}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedNetwork.id === 'twitter' && 'Maximum 280 caractères (X/Twitter).'}
            {selectedNetwork.id === 'linkedin' && 'Idéal pour un contenu professionnel et informatif.'}
            {selectedNetwork.id === 'facebook' && 'Contenu varié, images et textes fonctionnent bien.'}
            {selectedNetwork.id === 'instagram' && 'Fonctionne mieux avec des visuels. Texte dans la légende.'}
          </p>
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

        {/* Section upload d'image pour LinkedIn */}
        {formData.network === 'linkedin' && (
          <div className="form-group">
            <label className="label">
              Image (LinkedIn uniquement)
              <span className="ml-1 text-xs text-gray-500">(optionnel, max 5 MB)</span>
            </label>
            <div className="mt-2">
              {selectedImage ? (
                <div className="relative border-2 border-dashed border-cartoon-dark/30 rounded-cartoon p-2 bg-cartoon-bg/20">
                  <img 
                    src={selectedImage.preview} 
                    alt="Prévisualisation" 
                    className="mx-auto max-h-64 rounded-cartoon object-contain" 
                  />
                  <div className="flex items-center justify-center mt-2">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1 bg-cartoon-red/90 text-white text-sm rounded-full hover:bg-cartoon-red transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-cartoon-dark/30 rounded-cartoon p-6 text-center hover:bg-cartoon-bg/10 transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <label 
                    htmlFor="image"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <svg className="w-12 h-12 mb-2 text-cartoon-blue/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-cartoon-dark font-medium">Cliquez pour ajouter une image</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG ou GIF jusqu'à 5 MB</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

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