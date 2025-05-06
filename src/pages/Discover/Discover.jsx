import React, { useState } from 'react';
import './Discover.css';

const Discover = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'Tous' },
    { id: 'beaches', name: 'Plages' }, 
    { id: 'mountains', name: 'Montagnes' }, 
    { id: 'desert', name: 'Désert' }, 
    { id: 'historical', name: 'Villes historiques' }, 
    { id: 'crafts', name: 'Artisanat' }, 
    { id: 'food', name: 'Gastronomie' }, 
    { id: 'architecture', name: 'Architecture' }
  ];
  
  const destinations = [
    { 
      id: '1', 
      title: 'Désert du Sahara', 
      image: '/api/placeholder/300/200',
      description: 'Explorez les magnifiques dunes de sable du Sahara marocain',
      location: 'Merzouga, Maroc',
      rating: 4.9,
      categories: ['desert']
    },
    { 
      id: '2', 
      title: 'Chefchaouen', 
      image: '/api/placeholder/300/200',
      description: 'Découvrez la fameuse ville bleue du nord du Maroc',
      location: 'Chefchaouen, Maroc',
      rating: 4.8,
      categories: ['historical', 'architecture']
    },
    { 
      id: '3', 
      title: 'Jardins Majorelle', 
      image: '/api/placeholder/300/200',
      description: 'Visitez ces jardins botaniques et paysagers uniques à Marrakech',
      location: 'Marrakech, Maroc',
      rating: 4.7,
      categories: ['architecture']
    },
    { 
      id: '4', 
      title: 'Médina de Fès', 
      image: '/api/placeholder/300/200',
      description: 'Plongez dans l\'une des plus grandes médinas piétonnes du monde',
      location: 'Fès, Maroc',
      rating: 4.6,
      categories: ['historical', 'crafts', 'architecture']
    }
  ];
  
  const filteredDestinations = activeCategory === 'all' 
    ? destinations 
    : destinations.filter(dest => dest.categories.includes(activeCategory));

  return (
    <div className="discover-page">
      <h2 className="discover-title">Découvrir le Maroc</h2>
      
      {/* Catégories */}
      <div className="categories-container">
        <div className="categories-list">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Destinations populaires */}
      <div>
        <div className="section-header">
          <h3 className="section-title">Destinations populaires</h3>
          <a href="#" className="view-all-link">
            Voir tout <span>→</span>
          </a>
        </div>
        
        <div className="destinations-grid">
          {filteredDestinations.map((destination, index) => (
            <div 
              key={destination.id} 
              className="destination-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="destination-image">
                <img src={destination.image} alt={destination.title} />
                <div className="destination-rating">
                  {destination.rating} <span>★</span>
                </div>
              </div>
              
              <div className="destination-content">
                <h4 className="destination-title">{destination.title}</h4>
                <p className="destination-description">{destination.description}</p>
                <div className="destination-location">
                  <span>📍</span>
                  <span>{destination.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bannière promotionnelle */}
      <div className="promo-banner">
        <div className="promo-content">
          <div className="promo-info">
            <h3 className="promo-title">Offre spéciale</h3>
            <p className="promo-text">20% de réduction sur toutes les réservations d'excursions désert</p>
            <p className="promo-date">Offre valable jusqu'au 31 mai 2025</p>
          </div>
          <button className="promo-button">
            En savoir plus
          </button>
        </div>
      </div>
      
      {/* Guide interactif */}
      <div className="guide-card">
        <h3 className="guide-title">
          Guide interactif
        </h3>
        <p className="guide-text">
          Utilisez notre guide interactif pour planifier votre voyage au Maroc. Sélectionnez vos centres d'intérêt 
          et nous vous proposerons un itinéraire personnalisé.
        </p>
        <button className="button">Commencer</button>
      </div>
    </div>
  );
};

export default Discover;