import { Menu, X, Sun, Moon, Search, Bell } from 'lucide-react';
import './Header.css';

const Header = ({ isDarkMode, toggleDarkMode, toggleSearch, toggleMobileMenu, isMobile }) => {
  return (
    <header className="header">
      {/* Menu mobile */}
      {isMobile && (
        <button className="header-icon-button" onClick={toggleMobileMenu}>
          <Menu size={20} />
        </button>
      )}
      
      {/* Logo */}
      <div className="header-logo">Super App</div>
      
      {/* Actions */}
      <div className="header-actions">
        <button className="header-icon-button" onClick={toggleSearch}>
          <Search size={20} />
        </button>
        
        <button className="header-icon-button notification-button">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        
        <button className="header-icon-button" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;