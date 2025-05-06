import React, { useState } from 'react';
import './Events.css';

const Events = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Festival de Fès',
      description: 'Festival international de musique sacrée avec des artistes du monde entier',
      image: '/api/placeholder/300/200',
      location: 'Fès, Maroc',
      price: '200 MAD',
      date: '2025-06-12',
    },
    {
      id: '2',
      title: 'Exposition d\'art contemporain',
      description: 'Découvrez les œuvres d\'artistes marocains émergents',
      image: '/api/placeholder/300/200',
      location: 'Rabat, Maroc',
      price: 'Entrée libre',
      date: '2025-05-20',
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    location: '',
    price: '',
    date: '',
  });

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.title || !formData.description || !formData.location) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Créer un nouvel événement
    const newEvent = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      image: formData.image ? URL.createObjectURL(formData.image) : '/api/placeholder/300/200',
      location: formData.location,
      price: formData.price || 'Gratuit',
      date: formData.date || new Date().toISOString().split('T')[0],
    };
    
    // Ajouter le nouvel événement à la liste
    setEvents([...events, newEvent]);
    
    // Réinitialiser le formulaire et le fermer
    setFormData({
      title: '',
      description: '',
      image: null,
      location: '',
      price: '',
      date: '',
    });
    setIsFormVisible(false);
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h2>Événements</h2>
        <button 
          className={`button add-event-button ${isFormVisible ? 'secondary' : ''}`}
          onClick={toggleForm}
        >
          {isFormVisible ? 'Annuler' : 'Ajouter un événement'}
        </button>
      </div>
      
      {/* Formulaire d'ajout d'événement */}
      <div className={`event-form-container ${isFormVisible ? 'visible' : ''}`}>
        <h3 className="event-form-title">Ajouter un événement</h3>
        
        <form className="event-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Lieu *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group event-form-full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Prix</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Gratuit, 100 MAD, etc."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group event-form-full-width">
            <label htmlFor="image">Image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleInputChange}
            />
          </div>
          
          <div className="event-form-actions">
            <button type="button" className="button secondary" onClick={toggleForm}>
              Annuler
            </button>
            <button type="submit" className="button">
              Ajouter
            </button>
          </div>
        </form>
      </div>
      
      {/* Liste des événements */}
      <div className="events-grid">
        {events.map((event, index) => (
          <div key={event.id} className="event-card" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="event-image">
              <img src={event.image} alt={event.title} />
              <div className="event-date-badge">
                {formatDate(event.date)}
              </div>
            </div>
            
            <div className="event-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
              
              <div className="event-meta">
                <div className="event-location">
                  <span>📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="event-price">{event.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;