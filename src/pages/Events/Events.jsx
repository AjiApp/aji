import './Events.css';

const EventsPage = () => {
  const events = [
    {
      id: '1',
      title: 'Fes Festival',
      description: 'International sacred music festival featuring artists from around the world',
      date: 'June 12, 2025',
      location: 'Fes, Morocco',
      price: '200 MAD'
    },
    {
      id: '2',
      title: 'Contemporary Art Exhibition',
      description: 'Discover works by emerging Moroccan artists',
      date: 'May 20, 2025',
      location: 'Rabat, Morocco',
      price: 'Free entry'
    }
  ];

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="page-title">Events</h1>
        <button className="primary-button">
          Add an Event
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
