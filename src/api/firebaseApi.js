// src/api/firebaseApi.js - Utilisant Firebase SDK directement
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc,
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
  } from 'firebase/storage';
  import { db, storage } from '../firebase/config';
  
  // Collections Firestore
  const locationsCollection = collection(db, 'locals');
  const featuresCollection = collection(db, 'features');
  
  // API pour les lieux
  export const locationsApi = {
    // Récupérer tous les lieux
    getAll: async () => {
      const q = query(locationsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    },
    
    // Récupérer un lieu par ID
    getById: async (id) => {
      const docRef = doc(db, 'locals', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Location with ID ${id} not found`);
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date()
      };
    },
    
    // Ajouter un lieu
    create: async ({ locationData, imageFile }) => {
      let imageUrl = null;
      
      // Si un fichier image est fourni, on l'upload dans Firebase Storage
      if (imageFile) {
        const storageRef = ref(storage, `locations/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Ajouter le document dans Firestore avec l'URL de l'image
      const docRef = await addDoc(locationsCollection, {
        ...locationData,
        imageUrl: imageUrl || locationData.imageUrl || '/api/placeholder/300/200',
        createdAt: serverTimestamp()
      });
      
      // Récupérer le document nouvellement créé pour être cohérent avec l'API
      const newDocSnap = await getDoc(docRef);
      
      return {
        id: docRef.id,
        ...newDocSnap.data(),
        createdAt: new Date() // serverTimestamp() ne sera pas instantanément disponible
      };
    },
    
    // Mettre à jour un lieu
    update: async ({ id, locationData, imageFile }) => {
      const locationRef = doc(db, 'locals', id);
      let imageUrl = locationData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        const storageRef = ref(storage, `locations/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      const updatedData = {
        ...locationData,
        imageUrl,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(locationRef, updatedData);
      
      // Récupérer le document mis à jour
      const updatedDocSnap = await getDoc(locationRef);
      
      return {
        id,
        ...updatedDocSnap.data(),
        updatedAt: new Date() // serverTimestamp() ne sera pas instantanément disponible
      };
    },
    
    // Supprimer un lieu
    delete: async (id) => {
      // D'abord, vérifier si le document existe et récupérer l'URL de l'image
      const locationRef = doc(db, 'locals', id);
      const docSnap = await getDoc(locationRef);
      
      if (docSnap.exists()) {
        const { imageUrl } = docSnap.data();
        
        // Supprimer l'image de Firebase Storage si elle existe et n'est pas un placeholder
        if (imageUrl && !imageUrl.includes('/api/placeholder/')) {
          try {
            // Extraire le chemin du fichier à partir de l'URL
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
            // Continuer malgré l'erreur de suppression d'image
          }
        }
        
        // Supprimer le document de Firestore
        await deleteDoc(locationRef);
      }
      
      return id;
    }
  };
  
  // API pour les contenus features
  export const contentsApi = {
    // Récupérer tous les contenus
    getAll: async () => {
      const q = query(featuresCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    },
    
    // Récupérer un contenu par ID
    getById: async (id) => {
      const docRef = doc(db, 'features', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Feature with ID ${id} not found`);
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date()
      };
    },
    
    // Ajouter un contenu
    create: async ({ contentData, imageFile }) => {
      let imageUrl = null;
      
      // Si un fichier image est fourni, on l'upload dans Firebase Storage
      if (imageFile) {
        const storageRef = ref(storage, `features/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Ajouter le document dans Firestore avec l'URL de l'image
      const docRef = await addDoc(featuresCollection, {
        ...contentData,
        imageUrl: imageUrl || contentData.imageUrl || '/api/placeholder/400/200',
        createdAt: serverTimestamp()
      });
      
      // Récupérer le document nouvellement créé
      const newDocSnap = await getDoc(docRef);
      
      return {
        id: docRef.id,
        ...newDocSnap.data(),
        createdAt: new Date() // serverTimestamp() ne sera pas instantanément disponible
      };
    },
    
    // Mettre à jour un contenu
    update: async ({ id, contentData, imageFile }) => {
      const contentRef = doc(db, 'features', id);
      let imageUrl = contentData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        const storageRef = ref(storage, `features/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      const updatedData = {
        ...contentData,
        imageUrl,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(contentRef, updatedData);
      
      // Récupérer le document mis à jour
      const updatedDocSnap = await getDoc(contentRef);
      
      return {
        id,
        ...updatedDocSnap.data(),
        updatedAt: new Date() // serverTimestamp() ne sera pas instantanément disponible
      };
    },
    
    // Supprimer un contenu
    delete: async (id) => {
      // D'abord, vérifier si le document existe et récupérer l'URL de l'image
      const contentRef = doc(db, 'features', id);
      const docSnap = await getDoc(contentRef);
      
      if (docSnap.exists()) {
        const { imageUrl } = docSnap.data();
        
        // Supprimer l'image de Firebase Storage si elle existe et n'est pas un placeholder
        if (imageUrl && !imageUrl.includes('/api/placeholder/')) {
          try {
            // Extraire le chemin du fichier à partir de l'URL
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
            // Continuer malgré l'erreur de suppression d'image
          }
        }
        
        // Supprimer le document de Firestore
        await deleteDoc(contentRef);
      }
      
      return id;
    }
  };