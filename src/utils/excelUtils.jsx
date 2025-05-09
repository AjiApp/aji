// src/utils/excelUtils.js
import * as XLSX from 'xlsx';

/**
 * Exporte des données vers un fichier Excel
 * @param {Array} data - Tableau d'objets à exporter
 * @param {string} filename - Nom du fichier Excel (sans extension)
 * @param {string} sheetName - Nom de la feuille Excel
 */
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  try {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();
    
    // Convertir les données en feuille Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Générer le fichier et déclencher le téléchargement
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    return false;
  }
};

/**
 * Importe des données depuis un fichier Excel
 * @param {File} file - Fichier Excel à importer
 * @returns {Promise<Array>} - Tableau d'objets importés
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Récupérer la première feuille
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir la feuille en tableau d'objets JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false, // Pour conserver les formattages
          dateNF: 'yyyy-mm-dd' // Format de date
        });
        
        resolve(jsonData);
      } catch (error) {
        console.error('Erreur lors de l\'import Excel:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('Erreur de lecture du fichier:', error);
      reject(error);
    };
    
    // Lire le fichier comme un ArrayBuffer
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Prépare les données pour l'export en Excel (normalise les données)
 * @param {Array} data - Données brutes
 * @param {string} type - Type de données (features, locations, accommodations, stadiums)
 * @returns {Array} - Données préparées pour l'export
 */
export const prepareDataForExport = (data, type) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => {
    // Filtrer les propriétés pertinentes selon le type
    const exportItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl || '', // Inclure l'URL de l'image
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '',
    };
    
    // Ajouter des propriétés spécifiques selon le type
    switch (type) {
      case 'features':
        // Pas de propriétés supplémentaires pour features
        break;
      case 'locations':
      case 'accommodations':
      case 'stadiums':
        exportItem.location = item.location || '';
        exportItem.price = item.price || '';
        exportItem.history = item.history || '';
        break;
    }
    
    return exportItem;
  });
};

/**
 * Valide les données importées pour s'assurer qu'elles ont la structure correcte
 * @param {Array} data - Données importées
 * @param {string} type - Type de données (features, locations, accommodations, stadiums)
 * @returns {Object} - Résultat de la validation {isValid, data, errors}
 */
export const validateImportData = (data, type) => {
  if (!data || !Array.isArray(data)) {
    return { isValid: false, data: [], errors: ['Données invalides ou vides'] };
  }
  
  const errors = [];
  const validatedData = [];
  
  // Vérifier les champs requis selon le type
  const requiredFields = ['title', 'description'];
  if (type !== 'features') {
    requiredFields.push('location');
  }
  
  data.forEach((item, index) => {
    const itemErrors = [];
    
    // Vérifier les champs requis
    requiredFields.forEach(field => {
      if (!item[field]) {
        itemErrors.push(`Ligne ${index + 1}: Le champ '${field}' est requis`);
      }
    });
    
    if (itemErrors.length === 0) {
      // Préparer l'objet validé
      const validItem = {
        title: item.title,
        description: item.description,
        imageName: item.imageName || null, // Prendre en compte un nom d'image spécifique
        imageUrl: item.imageUrl || '', // Conserver l'URL de l'image
      };
      
      // Ajouter des propriétés spécifiques selon le type
      if (type !== 'features') {
        validItem.location = item.location || '';
        validItem.price = item.price || '';
        validItem.history = item.history || '';
      }
      
      validatedData.push(validItem);
    } else {
      errors.push(...itemErrors);
    }
  });
  
  return {
    isValid: errors.length === 0,
    data: validatedData,
    errors
  };
};

/**
 * Fonction pour trouver une meilleure correspondance entre les images et les éléments
 * @param {string} fileName - Nom du fichier image
 * @param {Array} items - Liste des éléments
 * @returns {Object|null} - L'élément correspondant ou null
 */
export const findBestImageMatch = (fileName, items) => {
  // Normaliser le nom de fichier (enlever l'extension, remplacer les tirets et underscores par des espaces)
  const normalizedFileName = fileName
    .replace(/\.[^/.]+$/, "")  // Enlever l'extension
    .replace(/[_-]/g, ' ')     // Remplacer tirets et underscores par des espaces
    .toLowerCase();            // Mettre en minuscules
  
  // Chercher une correspondance exacte par titre ou imageName
  const exactMatch = items.find(item => {
    if (item.imageName && item.imageName.toLowerCase() === fileName.toLowerCase()) {
      return true; // Correspondance exacte par imageName
    }
    return item.title.toLowerCase() === normalizedFileName;
  });
  
  if (exactMatch) return exactMatch;
  
  // Chercher une correspondance partielle
  const partialMatch = items.find(item => {
    const normalizedTitle = item.title.toLowerCase();
    return normalizedFileName.includes(normalizedTitle) || 
           normalizedTitle.includes(normalizedFileName);
  });
  
  return partialMatch || null;
};