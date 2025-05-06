import React, { useState, useEffect } from 'react';
// Import des feuilles de style
import './styles/global.css';
import './App.css';

// Import des composants
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';

// Import des pages
import Home from './pages/Home/Home';
import Features from './pages/Features/Features';
import Services from './pages/Services/Services';
import Events from './pages/Events/Events';
import Discover from './pages/Discover/Discover';

function App() {
  const [activePage, setActivePage] = useState(null); // Initialement, aucune page n'est active
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Gestion du mode sombre
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà des préférences
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode) {
      setIsDarkMode(savedMode === 'true');
    } else {
      // Sinon, vérifier les préférences système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Appliquer le mode sombre
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Sauvegarder la préférence
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Gérer la responsivité de la sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Basculer le mode sombre
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Basculer l'état de la sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Sélectionner une page
  const handlePageSelect = (pageId) => {
    setActivePage(pageId);
  };

  // Rendre la page active seulement si une page est sélectionnée
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home />;
      case 'features':
        return <Features />;
      case 'services':
        return <Services />;
      case 'events':
        return <Events />;
      case 'discover':
        return <Discover />;
      default:
        return (
          <div className="welcome-placeholder">
            <h2>Bienvenue sur Super App</h2>
            <p>Sélectionnez une option dans le menu pour commencer.</p>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <Sidebar 
        active={activePage} 
        onSelect={handlePageSelect} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      
      <div className="main-content">
        <Header 
          isDarkMode={isDarkMode}
          toggleTheme={toggleDarkMode}
          toggleSidebar={toggleSidebar}
        />
        
        <div className="content-area">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;