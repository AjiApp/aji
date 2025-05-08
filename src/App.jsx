// src/App.jsx with fixed routing and authentication
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './login';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MobileNavbar from './components/MobileNavbar/MobileNavbar';
import HomePage from './pages/Home/Home';
import FeaturesPage from './pages/Features/Features';
import ServicesPage from './pages/Services/Services';
import EventsPage from './pages/Events/Events';
import DiscoverPage from './pages/Discover/Discover';
import './App.css';

// Layout component to wrap authenticated pages
const MainLayout = ({ children }) => {
  const [activePage, setActivePage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Update active page based on the current route
  useEffect(() => {
    const path = location.pathname.substring(1) || 'home';
    setActivePage(path);
  }, [location]);
  
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
          user={auth.currentUser}
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
          {children}
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

// Auth wrapper for protected routes
const ProtectedRoute = ({ element }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return user ? <MainLayout>{element}</MainLayout> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <Login />
        } />
        
        <Route path="/" element={
          <ProtectedRoute element={<HomePage />} />
        } />
        
        <Route path="/home" element={
          <ProtectedRoute element={<HomePage />} />
        } />
        
        <Route path="/features" element={
          <ProtectedRoute element={<FeaturesPage />} />
        } />
        
        <Route path="/services" element={
          <ProtectedRoute element={<ServicesPage />} />
        } />
        
        <Route path="/events" element={
          <ProtectedRoute element={<EventsPage />} />
        } />
        
        <Route path="/discover" element={
          <ProtectedRoute element={<DiscoverPage />} />
        } />
        
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;