// src/contexts/NotificationContext.js
import { createContext, useContext, useState } from 'react';

// Créer le contexte
const NotificationContext = createContext();

// Durée par défaut des notifications (en ms)
const DEFAULT_DURATION = 3000;

// Provider du contexte
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  let timeoutId = null;

  // Afficher une notification
  const showNotification = (message, type = 'info', duration = DEFAULT_DURATION) => {
    // Annuler tout timer existant
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Définir la nouvelle notification
    setNotification({ message, type });
    
    // Programmer la fermeture automatique
    timeoutId = setTimeout(() => {
      setNotification(null);
      timeoutId = null;
    }, duration);
  };

  // Fermer manuellement la notification
  const closeNotification = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    setNotification(null);
  };

  // Raccourcis pour les types de notifications courants
  const showSuccess = (message, duration) => showNotification(message, 'success', duration);
  const showError = (message, duration) => showNotification(message, 'error', duration);
  const showInfo = (message, duration) => showNotification(message, 'info', duration);
  const showWarning = (message, duration) => showNotification(message, 'warning', duration);

  // Valeur du contexte
  const value = {
    notification,
    showNotification,
    closeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-message">{notification.message}</div>
          <button 
            className="notification-close"
            onClick={closeNotification}
          >
            ×
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de notification
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};