import React, { useState } from 'react';
import './Features.css';

const Features = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulaire soumis:', { title, description, file });
    // Réinitialiser le formulaire
    setTitle('');
    setDescription('');
    setFile(null);
    // Afficher un message de succès (en production, on utiliserait un système de notifications)
    alert('Contenu ajouté avec succès !');
  };

  const popularFeatures = [
    "Recherche avancée",
    "Notifications en temps réel",
    "Tableau de bord personnalisable",
    "Mode hors ligne",
    "Synchronisation multi-appareils"
  ];

  return (
    <div className="features-page">
      <h2 className="features-title">Fonctionnalités</h2>
      
      <div className="features-grid">
        {/* Formulaire d'ajout de contenu */}
        <div className="feature-form-card">
          <h3 className="feature-card-title">Ajouter un contenu</h3>
          
          <form className="feature-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Titre</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="file">Image</label>
              <input
                id="file"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            
            <button type="submit" className="button form-submit-button">
              Soumettre
              <span>→</span>
            </button>
          </form>
        </div>
        
        <div>
          {/* Fonctionnalités populaires */}
          <div className="popular-features-card">
            <h3 className="feature-card-title">Fonctionnalités populaires</h3>
            
            <ul className="feature-list">
              {popularFeatures.map((feature, index) => (
                <li key={index} className="feature-list-item">
                  <span className="feature-dot"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Carte de support */}
          <div className="support-card">
            <h3 className="support-title">Besoin d'aide ?</h3>
            <p className="support-text">
              Notre équipe de support est disponible 24/7 pour vous aider
            </p>
            <button className="support-button">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;