import { useNavigate } from 'react-router-dom';
import './MobileNavbar.css';

const MobileNavbar = ({ active, setActivePage }) => {
  const navigate = useNavigate();
  
  const navItems = [
    { id: 'home', label: 'Accueil', icon: '🏠', path: '/home' },
    { id: 'services', label: 'Services', icon: '🌐', path: '/services' },
    { id: 'events', label: 'Événements', icon: '📅', path: '/events' },
    { id: 'discover', label: 'Découvrir', icon: '🧭', path: '/discover' },
    { id: 'features', label: 'Fonctions', icon: '📄', path: '/features' },
  ];

  const handleNavigation = (item) => {
    setActivePage(item.id);
    navigate(item.path);
  };

  return (
    <nav className="mobile-navbar">
      <div className="mobile-navbar-content">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-navbar-item ${active === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item)}
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