// Import des fonctions nécessaires du SDK Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
// Remplacez ces valeurs par les vôtres à partir de votre console Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCQcGXm7iqF9kzjOCYIMfzzwoyRtO04jE",
  authDomain: "ajiapp-d436f.firebaseapp.com",
  projectId: "ajiapp-d436f",
  storageBucket: "ajiapp-d436f.firebasestorage.app",
  messagingSenderId: "486612088522",
  appId: "1:486612088522:web:afd8896e78d973942be633"
};


// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };