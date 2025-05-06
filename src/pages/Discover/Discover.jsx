import './Discover.css';

const DiscoverPage = () => {
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'beaches', name: 'Beaches' }, 
    { id: 'mountains', name: 'Mountains' }, 
    { id: 'desert', name: 'Desert' }, 
    { id: 'historical', name: 'Historical Cities' }, 
    { id: 'crafts', name: 'Handicrafts' }, 
    { id: 'food', name: 'Gastronomy' }
  ];

  const destinations = [
    { 
      id: '1', 
      title: 'Sahara Desert', 
      description: 'Explore the stunning sand dunes',
      location: 'Merzouga, Morocco',
      rating: 4.9
    },
    { 
      id: '2', 
      title: 'Chefchaouen', 
      description: 'Discover the famous blue city',
      location: 'Chefchaouen, Morocco',
      rating: 4.8
    },
    { 
      id: '3', 
      title: 'Majorelle Gardens', 
      description: 'Visit this unique botanical garden',
      location: 'Marrakech, Morocco',
      rating: 4.7
    },
    { 
      id: '4', 
      title: 'Fes Medina', 
      description: 'Step into this historic medina',
      location: 'Fes, Morocco',
      rating: 4.6
    }
  ];

  return (
    <div className="discover-page">
      <h1 className="page-title">Discover Morocco</h1>
      
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
          <h2 className="section-title">Popular Destinations</h2>
          <a href="#" className="see-all-link">
            See all <span className="arrow-icon">→</span>
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
      
     
    </div>
  );
};

export default DiscoverPage;
