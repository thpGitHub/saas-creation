import React from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  post: {
    title: string;
    content: string;
    publishDate: string;
    publishTime: string;
  };
}

export default function PreviewModal({ isOpen, onClose, onConfirm, post }: PreviewModalProps) {
  if (!isOpen) return null;

  const formattedDate = new Date(`${post.publishDate}T${post.publishTime}`).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Fonction pour extraire les hashtags du contenu
  const extractHashtags = (text: string) => {
    const hashtagRegex = /(#\w+)/g;
    const matches = text.match(hashtagRegex) || [];
    return matches;
  };

  const hashtags = extractHashtags(post.content);
  const hashtagRegex = /(#\w+)/g;
  const contentWithoutHashtags = hashtags.length > 0 
    ? post.content.replace(hashtagRegex, '').trim() 
    : post.content;

  return (
    <div className="linkedin-preview-container">
      <div className="linkedin-preview-modal">
        {/* En-tête du modal */}
        <div className="linkedin-preview-header">
          <h2 className="linkedin-preview-title">Prévisualisation LinkedIn</h2>
          <button onClick={onClose} className="linkedin-preview-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        {/* Post LinkedIn */}
        <div className="linkedin-preview-content">
          <div className="linkedin-post">
            {/* Header avec profil */}
            <div className="linkedin-post-header">
              <div className="linkedin-avatar">
                SP
              </div>
              <div className="linkedin-profile-info">
                <p className="linkedin-profile-name">SocialPost</p>
                <p className="linkedin-profile-title">Votre entreprise • <span>Suivi</span></p>
                <p className="linkedin-post-time">{formattedDate} • <span className="inline-flex items-center"><svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>Public</span></p>
              </div>
              <button className="ml-auto text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
            </div>
            
            {/* Contenu du post */}
            <div className="linkedin-post-body">
              <h3 className="linkedin-post-title">{post.title}</h3>
              <p className="linkedin-post-text">{contentWithoutHashtags}</p>
              
              {/* Hashtags */}
              {hashtags.length > 0 && (
                <div className="linkedin-hashtags">
                  {hashtags.map((tag, index) => (
                    <span key={index} className="linkedin-hashtag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Image de séparation pour un look plus réaliste */}
            <div className="linkedin-divider"></div>
            
            {/* Section interactions */}
            <div className="linkedin-stats">
              <span className="linkedin-like-count">
                <div className="linkedin-like-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                </div>
                <span>54</span>
              </span>
              <span className="linkedin-comment-count">12 commentaires</span>
            </div>
            
            <div className="linkedin-actions">
              <button className="linkedin-action-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                J'aime
              </button>
              <button className="linkedin-action-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                Commenter
              </button>
              <button className="linkedin-action-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                Partager
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer avec boutons d'action */}
        <div className="linkedin-modal-footer">
          <button
            onClick={onClose}
            className="linkedin-edit-btn"
          >
            Modifier
          </button>
          <button
            onClick={onConfirm}
            className="linkedin-publish-btn"
          >
            Publier
          </button>
        </div>
      </div>
    </div>
  );
} 