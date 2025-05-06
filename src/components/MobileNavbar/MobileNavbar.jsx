import './MobileNavbar.css';

const MobileNavbar = ({ active, setActivePage }) => {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: '🏠' },
    { id: 'services', label: 'Services', icon: '🌐' },
    { id: 'events', label: 'Événements', icon: '📅' },
    { id: 'discover', label: 'Découvrir', icon: '🧭' },
    { id: 'features', label: 'Fonctions', icon: '📄' },
  ];

  return (
    <nav className="mobile-navbar">
      <div className="mobile-navbar-content">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-navbar-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="mobile-navbar-icon">{item.icon}</span>
            <span className="mobile-navbar-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavbar;