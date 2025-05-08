// src/api/firebaseApi.js - Utilisant Firebase SDK directement avec corrections
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
      console.log("Upload de test réussi:", uploadTask);
      
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
    
    // Ajouter un lieu - CORRIGÉ pour l'upload d'images
    create: async ({ locationData, imageFile }) => {
      let imageUrl = null;
      
      // Si un fichier image est fourni, on l'upload dans Firebase Storage
      if (imageFile) {
        try {
          console.log("Début de l'upload d'image...", typeof imageFile, imageFile instanceof File);
          
          // Vérifier que c'est bien un fichier valide
          const isValidFile = imageFile instanceof File || imageFile instanceof Blob;
          if (!isValidFile) {
            console.error("Type de fichier invalide pour l'upload:", typeof imageFile);
            throw new Error("Type de fichier invalide");
          }
          
          // Création d'une référence avec un nom unique pour l'image
          const fileName = imageFile instanceof File ? imageFile.name : `image_${Date.now()}.jpg`;
          const storageRef = ref(storage, `locations/${Date.now()}_${fileName}`);
          
          // Upload du fichier avec les métadonnées correctes
          const fileType = imageFile.type || 'image/jpeg';
          console.log("Upload avec type:", fileType);
          
          const uploadResult = await uploadBytes(storageRef, imageFile, {
            contentType: fileType
          });
          console.log("Upload réussi:", uploadResult);
          
          // Obtenir l'URL de téléchargement après upload réussi
          imageUrl = await getDownloadURL(storageRef);
          console.log("Image uploadée avec succès, URL:", imageUrl);
        } catch (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
          throw error; // Propager l'erreur pour la gérer dans l'interface
        }
      }
      
      try {
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
      } catch (error) {
        console.error("Erreur lors de la création du document:", error);
        throw error;
      }
    },
    
    // Mettre à jour un lieu - CORRIGÉ pour l'upload d'images
    update: async ({ id, locationData, imageFile }) => {
      const locationRef = doc(db, 'locals', id);
      let imageUrl = locationData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        try {
          console.log("Mise à jour d'image...", typeof imageFile, imageFile instanceof File);
          
          // Vérifier que c'est bien un fichier valide
          const isValidFile = imageFile instanceof File || imageFile instanceof Blob;
          if (!isValidFile) {
            console.error("Type de fichier invalide pour l'upload:", typeof imageFile);
            throw new Error("Type de fichier invalide");
          }
          
          // Création d'une référence avec un nom unique pour l'image
          const fileName = imageFile instanceof File ? imageFile.name : `image_${Date.now()}.jpg`;
          const storageRef = ref(storage, `locations/${Date.now()}_${fileName}`);
          
          // Upload du fichier avec les métadonnées correctes
          const fileType = imageFile.type || 'image/jpeg';
          
          await uploadBytes(storageRef, imageFile, {
            contentType: fileType
          });
          
          // Obtenir l'URL de téléchargement
          imageUrl = await getDownloadURL(storageRef);
          console.log("Image mise à jour avec succès, URL:", imageUrl);
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'image:", error);
          throw error;
        }
      }
      
      try {
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
  
  // API pour les contenus features - AVEC MÊMES CORRECTIONS
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
    
    // Ajouter un contenu - CORRIGÉ pour l'upload d'images
    create: async ({ contentData, imageFile }) => {
      let imageUrl = null;
      
      // Si un fichier image est fourni, on l'upload dans Firebase Storage
      if (imageFile) {
        try {
          console.log("Début de l'upload d'image pour feature...", typeof imageFile);
          
          // Vérifier que c'est bien un fichier valide
          const isValidFile = imageFile instanceof File || imageFile instanceof Blob;
          if (!isValidFile) {
            console.error("Type de fichier invalide pour l'upload:", typeof imageFile);
            throw new Error("Type de fichier invalide");
          }
          
          // Création d'une référence avec un nom unique pour l'image
          const fileName = imageFile instanceof File ? imageFile.name : `image_${Date.now()}.jpg`;
          const storageRef = ref(storage, `features/${Date.now()}_${fileName}`);
          
          // Upload du fichier avec les métadonnées correctes
          const fileType = imageFile.type || 'image/jpeg';
          
          await uploadBytes(storageRef, imageFile, {
            contentType: fileType
          });
          
          // Obtenir l'URL de téléchargement après upload réussi
          imageUrl = await getDownloadURL(storageRef);
          console.log("Image uploadée avec succès, URL:", imageUrl);
        } catch (error) {
          console.error("Erreur lors de l'upload de l'image:", error);
          throw error;
        }
      }
      
      try {
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
      } catch (error) {
        console.error("Erreur lors de la création du document:", error);
        throw error;
      }
    },
    
    // Mettre à jour un contenu - CORRIGÉ pour l'upload d'images
    update: async ({ id, contentData, imageFile }) => {
      const contentRef = doc(db, 'features', id);
      let imageUrl = contentData.imageUrl;
      
      // Si un nouveau fichier image est fourni, on l'upload
      if (imageFile) {
        try {
          console.log("Mise à jour d'image pour feature...", typeof imageFile);
          
          // Vérifier que c'est bien un fichier valide
          const isValidFile = imageFile instanceof File || imageFile instanceof Blob;
          if (!isValidFile) {
            console.error("Type de fichier invalide pour l'upload:", typeof imageFile);
            throw new Error("Type de fichier invalide");
          }
          
          // Création d'une référence avec un nom unique pour l'image
          const fileName = imageFile instanceof File ? imageFile.name : `image_${Date.now()}.jpg`;
          const storageRef = ref(storage, `features/${Date.now()}_${fileName}`);
          
          // Upload du fichier avec les métadonnées correctes
          const fileType = imageFile.type || 'image/jpeg';
          
          await uploadBytes(storageRef, imageFile, {
            contentType: fileType
          });
          
          // Obtenir l'URL de téléchargement
          imageUrl = await getDownloadURL(storageRef);
          console.log("Image mise à jour avec succès, URL:", imageUrl);
        } catch (error) {
          console.error("Erreur lors de la mise à jour de l'image:", error);
          throw error;
        }
      }
      
      try {
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