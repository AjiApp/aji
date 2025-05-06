import { X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ active, setActivePage, isMobile = false, closeMobileMenu }) => {
  const menu = [
    { id: 'home', label: 'Accueil', icon: '🏠' },
    { id: 'features', label: 'Fonctionnalités', icon: '📄' },
    { id: 'services', label: 'Services', icon: '🌐' },
    { id: 'events', label: 'Événements', icon: '📅' },
    { id: 'discover', label: 'Découvrir', icon: '🧭' },
  ];

  return (
    <div className={`sidebar ${isMobile ? 'sidebar-mobile slide-in-left' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">Menu</div>
        {isMobile && (
          <button className="sidebar-close-button" onClick={closeMobileMenu}>
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menu.map((item) => (
            <li key={item.id} className="sidebar-menu-item">
              <button
                onClick={() => setActivePage(item.id)}
                className={`sidebar-menu-button ${active === item.id ? 'active' : ''}`}
              >
                <span className="sidebar-menu-icon">{item.icon}</span>
                <span className="sidebar-menu-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        &copy; 2025 Super App
      </div>
    </div>
  );
};

export default Sidebar;