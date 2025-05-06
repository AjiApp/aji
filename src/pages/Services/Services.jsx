import React from 'react';
import './Services.css';

const Services = () => {
  const services = [
    { id: 'e-sim', name: 'E‑SIM', icon: '📱' },
    { id: 'visa', name: 'Visas', icon: '🛂' },
    { id: 'tickets', name: 'Billets', icon: '🎫' },
    { id: 'flights', name: 'Vols', icon: '✈️' },
    { id: 'accommodation', name: 'Hébergement', icon: '🏨' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'visit', name: 'Visiter le Maroc', icon: '🏝️' },
    { id: 'food', name: 'Gastronomie', icon: '🍽️' },
    { id: 'contacts', name: 'Contacts importants', icon: '📞' },
  ];

  const handleServiceClick = (serviceId) => {
    console.log(`Service clicked: ${serviceId}`);
    // En production, on pourrait naviguer vers une page détaillée du service
    // ou ouvrir un modal avec plus d'informations
    alert(`Vous avez sélectionné le service: ${serviceId}`);
  };

  return (
    <div className="services-page">
      <h2 className="services-title">Services</h2>
      
      <div className="services-grid">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="service-card"
            onClick={() => handleServiceClick(service.id)}
          >
            <div className="service-content">
              <div className="service-icon-name">
                <span className="service-icon">{service.icon}</span>
                <span className="service-name">{service.name}</span>
              </div>
              <span className="service-arrow">→</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="custom-services">
        <h3 className="custom-services-title">Services personnalisés</h3>
        <p className="custom-services-text">
          Nous pouvons créer des offres sur mesure pour répondre à vos besoins spécifiques.
          Contactez notre équipe pour plus d'informations.
        </p>
        <button className="button">Demander un devis</button>
      </div>
    </div>
  );
};

export default Services;