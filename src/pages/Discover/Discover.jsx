import './Discover.css';

const DiscoverPage = () => {
  const categories = [
    { id: 'all', name: 'Tous' },
    { id: 'beaches', name: 'Plages' }, 
    { id: 'mountains', name: 'Montagnes' }, 
    { id: 'desert', name: 'Désert' }, 
    { id: 'historical', name: 'Villes historiques' }, 
    { id: 'crafts', name: 'Artisanat' }, 
    { id: 'food', name: 'Gastronomie' }
  ];

  const destinations = [
    { 
      id: '1', 
      title: 'Désert du Sahara', 
      description: 'Explorez les magnifiques dunes de sable',
      location: 'Merzouga, Maroc',
      rating: 4.9
    },
    { 
      id: '2', 
      title: 'Chefchaouen', 
      description: 'Découvrez la fameuse ville bleue',
      location: 'Chefchaouen, Maroc',
      rating: 4.8
    },
    { 
      id: '3', 
      title: 'Jardins Majorelle', 
      description: 'Visitez ces jardins botaniques uniques',
      location: 'Marrakech, Maroc',
      rating: 4.7
    },
    { 
      id: '4', 
      title: 'Médina de Fès', 
      description: 'Plongez dans cette médina historique',
      location: 'Fès, Maroc',
      rating: 4.6
    }
  ];

  return (
    <div className="discover-page">
      <h1 className="page-title">Découvrir le Maroc</h1>
      
      <div className="categories-container">
        <div className="categories-scrollable">
          {categories.map((category, index) => (
            <button 
              key={category.id} 
              className={`category-button ${index === 0 ? 'active' : ''}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Destinations populaires</h2>
          <a href="#" className="see-all-link">
            Voir tout <span className="arrow-icon">→</span>
          </a>
        </div>
        
        <div className="destinations-grid">
          {destinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <div className="destination-image">
                <img src="/api/placeholder/300/128" alt={dest.title} />
                <div className="destination-rating">
                  {dest.rating} ★
                </div>
              </div>
              <div className="destination-details">
                <h3 className="destination-title">{dest.title}</h3>
                <p className="destination-description">{dest.description}</p>
                <div className="destination-location">
                  <span className="location-icon">📍</span>
                  <span>{dest.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="special-offer-banner">
        <div className="offer-content">
          <div>
            <h3 className="offer-title">Offre spéciale</h3>
            <p className="offer-description">20% de réduction sur toutes les réservations d'excursions désert</p>
            <p className="offer-expiry">Offre valable jusqu'au 31 mai 2025</p>
          </div>
          <button className="offer-button">
            En savoir plus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;