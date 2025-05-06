import { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MobileNavbar from './components/MobileNavbar/MobileNavbar';
import HomePage from './pages/Home/Home';
import FeaturesPage from './pages/Features/Features';
import ServicesPage from './pages/Services/Services';
import EventsPage from './pages/Events/Events';
import DiscoverPage from './pages/Discover/Discover';
import './App.css';

const App = () => {
  // State management
  const [activePage, setActivePage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check screen size (mobile or desktop)
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile(); // on load
    window.addEventListener('resize', checkIfMobile); // on resize
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Handle dark mode toggling
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when switching pages
  const handlePageChange = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  // Page rendering logic
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'features':
        return <FeaturesPage />;
      case 'services':
        return <ServicesPage />;
      case 'events':
        return <EventsPage />;
      case 'discover':
        return <DiscoverPage />;
      default:
        return (
          <div className="welcome-container">
            <h2>Welcome to Super App</h2>
            <p>Select an option from the menu to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar for desktop */}
      {!isMobile && (
        <div className="sidebar-container">
          <Sidebar 
            active={activePage}
            setActivePage={handlePageChange}
          />
        </div>
      )}
      
      {/* Main content area */}
      <div className={`main-content ${!isMobile ? 'with-sidebar' : ''}`}>
        {/* Top Header */}
        <Header 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          toggleSearch={toggleSearch}
          toggleMobileMenu={toggleMobileMenu}
          isMobile={isMobile}
        />
        
        {/* Mobile Sidebar menu */}
        {isMobile && isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <Sidebar 
              active={activePage}
              setActivePage={handlePageChange}
              isMobile={true}
              closeMobileMenu={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}
        
        {/* Search bar */}
        {isSearchOpen && (
          <div className="search-bar">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
                autoFocus
              />
            </div>
          </div>
        )}
        
        {/* Page content */}
        <div className="content-area">
          {renderPage()}
        </div>
        
        {/* Mobile Bottom Navbar */}
        {isMobile && (
          <MobileNavbar 
            active={activePage}
            setActivePage={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default App;
