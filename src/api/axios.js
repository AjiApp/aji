// src/api/axios.js
import axios from 'axios';
import { auth } from '../firebase/config'; // Importe auth depuis le fichier unifié

// Créer une instance d'axios avec une config par défaut
const api = axios.create({
  baseURL: 'https://ajiapp-d436f.firebaseapp.com/api', // Ajustez l'URL selon votre projet
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  async (config) => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion des erreurs selon les codes HTTP
    if (error.response) {
      // Erreur du serveur (statut hors de la plage 2xx)
      switch (error.response.status) {
        case 401:
          // Non autorisé - rediriger vers la page de connexion
          console.error('Erreur d\'authentification:', error);
          break;
        case 403:
          console.error('Accès interdit:', error);
          break;
        case 404:
          console.error('Ressource non trouvée:', error);
          break;
        case 500:
          console.error('Erreur serveur:', error);
          break;
        default:
          console.error('Erreur de requête:', error);
      }
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      console.error('Pas de réponse du serveur:', error.request);
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour télécharger des fichiers
export const uploadFile = async (file, path) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Fonction utilitaire pour créer une API CRUD standard
const createCrudApi = (resourcePath) => ({
  getAll: () => api.get(`/${resourcePath}`),
  getById: (id) => api.get(`/${resourcePath}/${id}`),
  create: (data) => api.post(`/${resourcePath}`, data),
  update: (id, data) => api.put(`/${resourcePath}/${id}`, data),
  delete: (id) => api.delete(`/${resourcePath}/${id}`)
});

// API pour les lieux à visiter (Visit Morocco)
export const locationsAPI = createCrudApi('locals');

// API pour les fonctionnalités
export const featuresAPI = createCrudApi('features');

// API pour les hébergements (Accommodations)
export const accommodationsAPI = createCrudApi('accommodations');

// API pour les stades (Stadiums)
export const stadiumsAPI = createCrudApi('stadiums');

// API pour l'upload de fichiers
export const uploadsAPI = {
  uploadFile: (file, path) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
};

export default api;