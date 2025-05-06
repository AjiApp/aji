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
  // États pour gérer les différentes fonctionnalités
  const [activePage, setActivePage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Vérifier si l'appareil est mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Vérifier au chargement
    checkIfMobile();
    
    // Vérifier au redimensionnement
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Gestion du mode sombre
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Basculer le mode sombre
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Basculer la recherche
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  // Basculer le menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fermer le menu mobile lors du changement de page
  const handlePageChange = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  // Rendu des pages
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
            <h2>Bienvenue sur Super App</h2>
            <p>
              Sélectionnez une option dans le menu pour commencer.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar pour desktop */}
      {!isMobile && (
        <div className="sidebar-container">
          <Sidebar 
            active={activePage}
            setActivePage={handlePageChange}
          />
        </div>
      )}
      
      {/* Zone principale */}
      <div className={`main-content ${!isMobile ? 'with-sidebar' : ''}`}>
        {/* Header */}
        <Header 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          toggleSearch={toggleSearch}
          toggleMobileMenu={toggleMobileMenu}
          isMobile={isMobile}
        />
        
        {/* Menu mobile */}
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
        
        {/* Barre de recherche */}
        {isSearchOpen && (
          <div className="search-bar">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Rechercher..."
                className="search-input"
                autoFocus
              />
            </div>
          </div>
        )}
        
        {/* Zone de contenu principal */}
        <div className="content-area">
          {renderPage()}
        </div>
        
        {/* Navigation mobile en bas */}
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