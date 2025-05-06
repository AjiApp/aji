import React from 'react';
import './Header.css';
import { Moon, Sun, Menu } from 'lucide-react';

const Header = ({ isDarkMode, toggleTheme, toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-logo">
        <span>Super App</span>
      </div>
      
      <div className="header-actions">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          className="mobile-menu-button" 
          onClick={toggleSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;