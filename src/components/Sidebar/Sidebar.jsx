import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ active, setActivePage, isMobile = false, closeMobileMenu }) => {
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
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        &copy; 2025 Super App
      </div>
    </div>
  );
};

export default Sidebar;