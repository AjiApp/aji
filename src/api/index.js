// src/api/index.js - Regroupe toutes les APIs
import api, { 
    uploadFile, 
    locationsAPI, 
    accommodationsAPI, 
    stadiumsAPI, 
    featuresAPI 
  } from './axios';
  import { 
    locationsApi, 
    contentsApi,
    accommodationsApi,
    stadiumsApi,
    debugUploadFile 
  } from './firebaseApi';
  
  // Réexporte les instances API
  export { 
    api as default,
    uploadFile,
    debugUploadFile,
    
    // APIs Axios (REST)
    locationsAPI,
    accommodationsAPI,
    stadiumsAPI,
    featuresAPI,
    
    // APIs Firebase (SDK)
    locationsApi,
    contentsApi,
    accommodationsApi,
    stadiumsApi
  };