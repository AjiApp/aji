import './Services.css';

const ServicesPage = () => {
  const services = [
    { id: 'e-sim', name: 'E‑SIM', icon: '📱' },
    { id: 'visa', name: 'Visas', icon: '🛂' },
    { id: 'tickets', name: 'Billets', icon: '🎫' },
    { id: 'flights', name: 'Vols', icon: '✈️' },
    { id: 'accommodation', name: 'Hébergement', icon: '🏨' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'visit', name: 'Visiter le Maroc', icon: '🏝️' },
    { id: 'food', name: 'Gastronomie', icon: '🍽️' }
  ];

  return (
    <div className="services-page">
      <h1 className="page-title">Services</h1>
      
      <div className="services-grid">
        {services.map((service) => (
          <div key={service.id} className="service-card">
            <div className="service-content">
              <div className="service-info">
                <span className="service-icon">{service.icon}</span>
                <span className="service-name">{service.name}</span>
              </div>
              <span className="service-arrow">→</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="custom-services-card">
        <h3 className="section-title">Services personnalisés</h3>
        <p className="section-text">
          Nous pouvons créer des offres sur mesure pour répondre à vos besoins spécifiques.
          Contactez notre équipe pour plus d'informations.
        </p>
        <button className="primary-button">
          Demander un devis
        </button>
      </div>
    </div>
  );
};

export default ServicesPage;