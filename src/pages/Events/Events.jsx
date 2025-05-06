import './Events.css';

const EventsPage = () => {
  const events = [
    {
      id: '1',
      title: 'Festival de Fès',
      description: 'Festival international de musique sacrée avec des artistes du monde entier',
      date: '12 juin 2025',
      location: 'Fès, Maroc',
      price: '200 MAD'
    },
    {
      id: '2',
      title: 'Exposition d\'art contemporain',
      description: 'Découvrez les œuvres d\'artistes marocains émergents',
      date: '20 mai 2025',
      location: 'Rabat, Maroc',
      price: 'Entrée libre'
    }
  ];

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="page-title">Événements</h1>
        <button className="primary-button">
          Ajouter un événement
        </button>
      </div>
      
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-image">
              <img src="/api/placeholder/400/160" alt={event.title} />
              <div className="event-date">{event.date}</div>
            </div>
            <div className="event-details">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-footer">
                <div className="event-location">
                  <span className="location-icon">📍</span>
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

export default EventsPage;