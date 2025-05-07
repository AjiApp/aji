import { createContext, useState, useContext, useEffect } from 'react';

// Créer le contexte
export const AppContext = createContext();

// Provider du contexte qui encapsulera l'application
export const AppProvider = ({ children }) => {
  // État pour les lieux (Services.jsx)
  const [locations, setLocations] = useState([]);
  
  // État pour les contenus (Features.jsx)
  const [contents, setContents] = useState([]);
  
  // Charger les données du localStorage au démarrage
  useEffect(() => {
    const savedLocations = localStorage.getItem('appLocations');
    const savedContents = localStorage.getItem('appContents');
    
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    }
    
    if (savedContents) {
      setContents(JSON.parse(savedContents));
    }
  }, []);
  
  // Sauvegarder les données dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('appLocations', JSON.stringify(locations));
  }, [locations]);
  
  useEffect(() => {
    localStorage.setItem('appContents', JSON.stringify(contents));
  }, [contents]);
  
  // Actions pour les lieux
  const addLocation = (location) => {
    setLocations([...locations, location]);
  };
  
  const updateLocation = (index, updatedLocation) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = updatedLocation;
    setLocations(updatedLocations);
  };
  
  const deleteLocation = (index) => {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  };
  
  // Actions pour les contenus
  const addContent = (content) => {
    setContents([content, ...contents]);
  };
  
  const updateContent = (index, updatedContent) => {
    const updatedContents = [...contents];
    updatedContents[index] = updatedContent;
    setContents(updatedContents);
  };
  
  const deleteContent = (index) => {
    const newContents = [...contents];
    newContents.splice(index, 1);
    setContents(newContents);
  };
  
  // Valeur du contexte qui sera accessible aux composants
  const value = {
    // Données
    locations,
    contents,
    
    // Actions pour les lieux
    addLocation,
    updateLocation,
    deleteLocation,
    
    // Actions pour les contenus
    addContent,
    updateContent,
    deleteContent
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte
export const useAppContext = () => useContext(AppContext);