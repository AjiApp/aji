// src/api/firebaseApi.js - Correction pour l'erreur de File object
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
  const locationsCollection = collection(db, 'locals');        // Places à visiter
  const featuresCollection = collection(db, 'features');       // Fonctionnalités
  const accommodationsCollection = collection(db, 'accommodations'); // Hébergements
  const stadiumsCollection = collection(db, 'stadiums');       // Stades
  
  // Fonction utilitaire pour déboguer les uploads
  export const debugUploadFile = async (file) => {
    if (!file) {
      console.error("Aucun fichier fourni pour le débogage d'upload");
      return null;
    }
  
    console.log("------------ DÉBOGAGE UPLOAD --------------");
    console.log("Type de fichier:", typeof file);
    console.log("Est-ce un Blob?", file instanceof Blob);
    console.log("Est-ce un File?", file instanceof File);
    
    if (file instanceof File || file instanceof Blob) {
      console.log("Taille du fichier:", file.size, "octets");
      console.log("Type MIME:", file.type);
      if (file instanceof File) {
        console.log("Nom du fichier:", file.name);
        console.log("Dernière modification:", new Date(file.lastModified));
      }
    } else {
      console.error("Le fichier n'est pas un objet Blob ou File valide");
    }
  
    try {
      // Test d'upload direct
      const storageRef = ref(storage, `debug/${Date.now()}_test`);
      const fileToUpload = file instanceof Blob ? file : new Blob([file], { type: 'image/jpeg' });
      
      console.log("Début de l'upload de test...");
      const uploadTask = await uploadBytes(storageRef, fileToUpload);
      console.log("Upload réussi:", uploadTask);
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log("URL de téléchargement:", downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error("Erreur lors du test d'upload:", error);
      console.log("Message d'erreur:", error.message);
      console.log("Code d'erreur:", error.code);
      return null;
    } finally {
      console.log("----------- FIN DÉBOGAGE UPLOAD -----------");
    }
  };
  
  // Fonction générique pour uploader une image (utilise toujours le dossier "locations")
  const uploadImage = async (imageFile, category = 'visit') => {
    if (!imageFile) return null;
    
    try {
      // Vérifier que c'est bien un fichier valide
      const isValidFile = imageFile instanceof File || imageFile instanceof Blob;
      if (!isValidFile) {
        console.error("Type de fichier invalide pour l'upload:", typeof imageFile);
        throw new Error("Type de fichier invalide");
      }
      
      // Utiliser le dossier "locations" pour tous les types mais ajouter la catégorie au nom du fichier
      const fileName = imageFile instanceof File ? imageFile.name : `image_${Date.now()}.jpg`;
      const storageRef = ref(storage, `locations/${category}_${Date.now()}_${fileName}`);
      
      // Upload du fichier avec les métadonnées correctes
      const fileType = imageFile.type || 'image/jpeg';
      
      await uploadBytes(storageRef, imageFile, {
        contentType: fileType
      });
      
      // Obtenir l'URL de téléchargement
      const imageUrl = await getDownloadURL(storageRef);
      console.log(`Image uploadée avec succès (catégorie: ${category}), URL:`, imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error(`Erreur lors de l'upload de l'image (catégorie: ${category}):`, error);
      throw error;
    }
  };
  
  // Fonction générique pour formater les données Firestore
  const formatDocData = (doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  });
  
  // API pour les lieux (Visit Morocco)
  export const locationsApi = {
    // Récupérer tous les lieux
    getAll: async () => {
      const q = query(locationsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(formatDocData);
    },
    
    // Récupérer un lieu par ID
    getById: async (id) => {
      const docRef = doc(db, 'locals', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Location with ID ${id} not found`);
      }
      
      return formatDocData(docSnap);
    },
    
    // Ajouter un lieu
    create: async ({ locationData, imageFile }) => {
      // Uploader l'image si fournie
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'visit');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...locationData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        // Ajouter le document dans Firestore avec l'URL de l'image
        const docRef = await addDoc(locationsCollection, {
          ...dataToSave,
          imageUrl: imageUrl || locationData.imageUrl || '/api/placeholder/300/200',
          createdAt: serverTimestamp()
        });
        
        // Récupérer le document nouvellement créé
        const newDocSnap = await getDoc(docRef);
        
        return {
          id: docRef.id,
          ...newDocSnap.data(),
          createdAt: new Date() // serverTimestamp() ne sera pas instantanément disponible
        };
      } catch (error) {
        console.error("Erreur lors de la création du document:", error);
        throw error;
      }
    },
    
    // Mettre à jour un lieu
    update: async ({ id, locationData, imageFile }) => {
      const locationRef = doc(db, 'locals', id);
      let imageUrl = locationData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'visit');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...locationData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        const updatedData = {
          ...dataToSave,
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
      } catch (error) {
        console.error("Erreur lors de la mise à jour du document:", error);
        throw error;
      }
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
      
      return snapshot.docs.map(formatDocData);
    },
    
    // Récupérer un contenu par ID
    getById: async (id) => {
      const docRef = doc(db, 'features', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Feature with ID ${id} not found`);
      }
      
      return formatDocData(docSnap);
    },
    
    // Ajouter un contenu
    create: async ({ contentData, imageFile }) => {
      let imageUrl = null;
      
      // Si un fichier image est fourni, on l'upload dans Firebase Storage
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'feature');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...contentData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        // Ajouter le document dans Firestore avec l'URL de l'image
        const docRef = await addDoc(featuresCollection, {
          ...dataToSave,
          imageUrl: imageUrl || contentData.imageUrl || '/api/placeholder/400/200',
          createdAt: serverTimestamp()
        });
        
        // Récupérer le document nouvellement créé
        const newDocSnap = await getDoc(docRef);
        
        return formatDocData(newDocSnap);
      } catch (error) {
        console.error("Erreur lors de la création du document:", error);
        throw error;
      }
    },
    
    // Mettre à jour un contenu
    update: async ({ id, contentData, imageFile }) => {
      const contentRef = doc(db, 'features', id);
      let imageUrl = contentData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'feature');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...contentData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        const updatedData = {
          ...dataToSave,
          imageUrl,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(contentRef, updatedData);
        
        // Récupérer le document mis à jour
        const updatedDocSnap = await getDoc(contentRef);
        
        return formatDocData(updatedDocSnap);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du document:", error);
        throw error;
      }
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
  
  // API pour les hébergements (Accommodations)
  export const accommodationsApi = {
    // Récupérer tous les hébergements
    getAll: async () => {
      const q = query(accommodationsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(formatDocData);
    },
    
    // Récupérer un hébergement par ID
    getById: async (id) => {
      const docRef = doc(db, 'accommodations', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Accommodation with ID ${id} not found`);
      }
      
      return formatDocData(docSnap);
    },
    
    // Ajouter un hébergement
    create: async ({ accommodationData, imageFile }) => {
      let imageUrl = null;
      
      // Si un fichier image est fourni, on l'upload
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'accommodation');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...accommodationData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        // Ajouter le document dans Firestore avec l'URL de l'image
        const docRef = await addDoc(accommodationsCollection, {
          ...dataToSave,
          imageUrl: imageUrl || accommodationData.imageUrl || '/api/placeholder/300/200',
          createdAt: serverTimestamp()
        });
        
        // Récupérer le document nouvellement créé
        const newDocSnap = await getDoc(docRef);
        
        return formatDocData(newDocSnap);
      } catch (error) {
        console.error("Erreur lors de la création de l'hébergement:", error);
        throw error;
      }
    },
    
    // Mettre à jour un hébergement
    update: async ({ id, accommodationData, imageFile }) => {
      const accommodationRef = doc(db, 'accommodations', id);
      let imageUrl = accommodationData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'accommodation');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...accommodationData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        const updatedData = {
          ...dataToSave,
          imageUrl,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(accommodationRef, updatedData);
        
        // Récupérer le document mis à jour
        const updatedDocSnap = await getDoc(accommodationRef);
        
        return formatDocData(updatedDocSnap);
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'hébergement:", error);
        throw error;
      }
    },
    
    // Supprimer un hébergement
    delete: async (id) => {
      const accommodationRef = doc(db, 'accommodations', id);
      const docSnap = await getDoc(accommodationRef);
      
      if (docSnap.exists()) {
        const { imageUrl } = docSnap.data();
        
        // Supprimer l'image de Firebase Storage si elle existe et n'est pas un placeholder
        if (imageUrl && !imageUrl.includes('/api/placeholder/')) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
          }
        }
        
        // Supprimer le document de Firestore
        await deleteDoc(accommodationRef);
      }
      
      return id;
    }
  };
  
  // API pour les stades (Stadiums)
  export const stadiumsApi = {
    // Récupérer tous les stades
    getAll: async () => {
      const q = query(stadiumsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(formatDocData);
    },
    
    // Récupérer un stade par ID
    getById: async (id) => {
      const docRef = doc(db, 'stadiums', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Stadium with ID ${id} not found`);
      }
      
      return formatDocData(docSnap);
    },
    
    // Ajouter un stade
    create: async ({ stadiumData, imageFile }) => {
      let imageUrl = null;
      
      // Si un fichier image est fourni, on l'upload
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'stadium');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...stadiumData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        // Ajouter le document dans Firestore avec l'URL de l'image
        const docRef = await addDoc(stadiumsCollection, {
          ...dataToSave,
          imageUrl: imageUrl || stadiumData.imageUrl || '/api/placeholder/300/200',
          createdAt: serverTimestamp()
        });
        
        // Récupérer le document nouvellement créé
        const newDocSnap = await getDoc(docRef);
        
        return formatDocData(newDocSnap);
      } catch (error) {
        console.error("Erreur lors de la création du stade:", error);
        throw error;
      }
    },
    
    // Mettre à jour un stade
    update: async ({ id, stadiumData, imageFile }) => {
      const stadiumRef = doc(db, 'stadiums', id);
      let imageUrl = stadiumData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, 'stadium');
      }
      
      try {
        // Créer une copie des données sans l'objet image
        const dataToSave = { ...stadiumData };
        // Supprimer la propriété image pour éviter l'erreur
        delete dataToSave.image;
        
        const updatedData = {
          ...dataToSave,
          imageUrl,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(stadiumRef, updatedData);
        
        // Récupérer le document mis à jour
        const updatedDocSnap = await getDoc(stadiumRef);
        
        return formatDocData(updatedDocSnap);
      } catch (error) {
        console.error("Erreur lors de la mise à jour du stade:", error);
        throw error;
      }
    },
    
    // Supprimer un stade
    delete: async (id) => {
      const stadiumRef = doc(db, 'stadiums', id);
      const docSnap = await getDoc(stadiumRef);
      
      if (docSnap.exists()) {
        const { imageUrl } = docSnap.data();
        
        // Supprimer l'image de Firebase Storage si elle existe et n'est pas un placeholder
        if (imageUrl && !imageUrl.includes('/api/placeholder/')) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Erreur lors de la suppression de l'image:", error);
          }
        }
        
        // Supprimer le document de Firestore
        await deleteDoc(stadiumRef);
      }
      
      return id;
    }
  };