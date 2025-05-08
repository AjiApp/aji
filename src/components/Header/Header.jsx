import { Menu, Search, Bell, User, Sun, Moon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ 
  isDarkMode, 
  toggleDarkMode, 
  toggleSearch, 
  toggleMobileMenu, 
  isMobile,
  user 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="header">
      {/* Mobile menu */}
      {isMobile && (
        <button className="header-icon-button" onClick={toggleMobileMenu} aria-label="Menu">
          <Menu size={22} />
        </button>
      )}
      
      {/* Logo */}
      <div className="header-logo">
        <div className="header-logo-icon">
          <span>A</span>
        </div>
        <span className="header-logo-text">AJI App</span>
      </div>
      
      {/* Action buttons */}
      <div className="header-actions">
        <button className="header-icon-button" onClick={toggleSearch} aria-label="Search">
          <Search size={20} />
        </button>
        
        <button className="header-icon-button notification-button" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>
        
        <button className="header-icon-button" onClick={toggleDarkMode} aria-label="Toggle theme">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="user-menu-container">
          <button 
            className="user-profile-button" 
            onClick={toggleUserMenu}
            aria-label="User menu"
          >
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isMobile && (
              <span className="user-name">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            )}
          </button>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-dropdown-avatar">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-dropdown-info">
                  <div className="user-dropdown-name">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="user-dropdown-email">{user?.email}</div>
                </div>
              </div>
              
              <div className="user-dropdown-menu">
                <button className="user-dropdown-item">
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button className="user-dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
