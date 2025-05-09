import { X, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ 
  active, 
  setActivePage, 
  isMobile = false, 
  closeMobileMenu,
  isDarkMode,
  toggleDarkMode
}) => {
  const navigate = useNavigate();
  
  const menu = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
    { id: 'features', label: 'Features', icon: '📄', path: '/features' },
    { id: 'services', label: 'Services', icon: '🌐', path: '/services' },
    { id: 'events', label: 'Events', icon: '📅', path: '/events' },
    { id: 'discover', label: 'Discover', icon: '🧭', path: '/discover' },
  ];

  const handleMenuClick = (item) => {
    setActivePage(item.id);
    navigate(item.path);
    
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

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
                onClick={() => handleMenuClick(item)}
                className={`sidebar-menu-button ${active === item.id ? 'active' : ''}`}
              >
                <span className="sidebar-menu-icon">{item.icon}</span>
                <span className="sidebar-menu-label">{item.label}</span>
              </button>
            </li>
          ))}
          
          {/* Ajout du bouton de toggle pour le thème */}
          <li className="sidebar-menu-item theme-toggle-item">
            <button
              onClick={toggleDarkMode}
              className="sidebar-menu-button theme-toggle"
              title={isDarkMode ? "Passer au thème clair" : "Passer au thème sombre"}
            >
              <span className="sidebar-menu-icon">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </span>
              <span className="sidebar-menu-label">
                {isDarkMode ? 'Thème Clair' : 'Thème Sombre'}
              </span>
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        &copy; 2025 Super App
      </div>
    </div>
  );
};

export default Sidebar;