// src/App.jsx with proper routing and authentication
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './login';
import Dashboard from './Dashboard';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
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

  // If still loading auth state, show loading
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Auth wrapper for protected routes
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/*" element={
          <ProtectedRoute>
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
                  user={user}
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
                
                {/* Page content - based on routes */}
                <div className="content-area">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                  </Routes>
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
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;