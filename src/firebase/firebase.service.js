import { db, storage } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Collection pour les lieux touristiques
const locationsCollection = collection(db, 'locations');

// Collection pour les contenus features
const contentsCollection = collection(db, 'contents');

// Ajouter un nouveau lieu
export const addLocation = async (locationData, imageFile) => {
  try {
    let imageUrl = null;
    
    // Si un fichier image est fourni, on l'upload dans Firebase Storage
    if (imageFile) {
      const storageRef = ref(storage, `locations/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    // Ajouter le document dans Firestore avec l'URL de l'image si disponible
    const docRef = await addDoc(locationsCollection, {
      ...locationData,
      imageUrl: imageUrl || locationData.imageUrl || '/api/placeholder/300/200',
      createdAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...locationData,
      imageUrl: imageUrl || locationData.imageUrl || '/api/placeholder/300/200'
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du lieu:", error);
    throw error;
  }
};

// Récupérer tous les lieux
export const getLocations = async () => {
  try {
    const q = query(locationsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des lieux:", error);
    throw error;
  }
};

// Mettre à jour un lieu
export const updateLocation = async (id, locationData, imageFile) => {
  try {
    const locationRef = doc(db, 'locations', id);
    
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
    
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du lieu:", error);
    throw error;
  }
};

// Supprimer un lieu
export const deleteLocation = async (id) => {
  try {
    const locationRef = doc(db, 'locations', id);
    await deleteDoc(locationRef);
    return id;
  } catch (error) {
    console.error("Erreur lors de la suppression du lieu:", error);
    throw error;
  }
};

// Ajouter un nouveau contenu (pour Features)
export const addContent = async (contentData, imageFile) => {
  try {
    let imageUrl = null;
    
    // Si un fichier image est fourni, on l'upload dans Firebase Storage
    if (imageFile) {
      const storageRef = ref(storage, `contents/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    // Ajouter le document dans Firestore avec l'URL de l'image si disponible
    const docRef = await addDoc(contentsCollection, {
      ...contentData,
      imageUrl: imageUrl || contentData.imageUrl || '/api/placeholder/400/200',
      createdAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...contentData,
      imageUrl: imageUrl || contentData.imageUrl || '/api/placeholder/400/200'
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du contenu:", error);
    throw error;
  }
};

// Récupérer tous les contenus
export const getContents = async () => {
  try {
    const q = query(contentsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des contenus:", error);
    throw error;
  }
};

// Mettre à jour un contenu
export const updateContent = async (id, contentData, imageFile) => {
  try {
    const contentRef = doc(db, 'contents', id);
    
    let imageUrl = contentData.imageUrl;
    
    // Si un nouveau fichier image est fourni, on l'upload
    if (imageFile) {
      const storageRef = ref(storage, `contents/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }
    
    const updatedData = {
      ...contentData,
      imageUrl,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(contentRef, updatedData);
    
    return {
      id,
      ...updatedData
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contenu:", error);
    throw error;
  }
};

// Supprimer un contenu
export const deleteContent = async (id) => {
  try {
    const contentRef = doc(db, 'contents', id);
    await deleteDoc(contentRef);
    return id;
  } catch (error) {
    console.error("Erreur lors de la suppression du contenu:", error);
    throw error;
  }
};