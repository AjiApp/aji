import React from 'react';
import './Sidebar.css';
import { Home, FileText, Globe, Calendar, Compass, X } from 'lucide-react';

const Sidebar = ({ active, onSelect, isOpen, toggleSidebar }) => {
  const menu = [
    { id: 'home', label: 'Accueil', icon: <Home size={20} /> },
    { id: 'features', label: 'Fonctionnalités', icon: <FileText size={20} /> },
    { id: 'services', label: 'Services', icon: <Globe size={20} /> },
    { id: 'events', label: 'Événements', icon: <Calendar size={20} /> },
    { id: 'discover', label: 'Découvrir', icon: <Compass size={20} /> },
  ];

  // Fonction pour gérer le clic sur un élément du menu
  const handleMenuItemClick = (itemId) => {
    // Appeler la fonction de sélection passée en props
    onSelect(itemId);
    
    // Fermer la sidebar sur mobile après la sélection
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay pour fermer le menu sur mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      ></div>
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">Super App</div>
          <button 
            className="mobile-menu-button" 
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menu.map(item => (
            <div
              key={item.id}
              className={`sidebar-nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          &copy; 2025 Super App
        </div>
      </aside>
    </>
  );
};

export default Sidebar;