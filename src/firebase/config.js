// Import des fonctions nécessaires du SDK Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCQcGXm7iqF9kzjOCYIMfzzwoyRtO04jE",
  authDomain: "ajiapp-d436f.firebaseapp.com",
  projectId: "ajiapp-d436f",
  storageBucket: "ajiapp-d436f.firebasestorage.app",
  messagingSenderId: "486612088522",
  appId: "1:486612088522:web:485d1d949cbabc392be633"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Exportation des services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);