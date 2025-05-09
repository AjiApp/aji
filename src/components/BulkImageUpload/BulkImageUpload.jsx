// src/components/BulkImageUpload/BulkImageUpload.jsx - Version améliorée
import { useState, useEffect } from 'react';
import { Upload, Image, Check, X, FolderOpen, Search, RefreshCw } from 'lucide-react';
import { findBestImageMatch } from '../../utils/excelUtils';
import './BulkImageUpload.css';

const BulkImageUpload = ({ items, updateItem, onSuccess, onError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ouvrir la modal d'import d'images
  const openModal = () => {
    setIsOpen(true);
    setFiles([]);
    setMatches([]);
    setProgress(0);
    setSearchQuery('');
  };
  
  // Fermer la modal
  const closeModal = () => {
    setIsOpen(false);
  };
  
  // Gérer la sélection de plusieurs fichiers
  const handleFilesSelected = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    findMatchesForFiles(selectedFiles);
  };
  
  // Trouver des correspondances entre les fichiers et les éléments
  const findMatchesForFiles = (selectedFiles) => {
    const newMatches = [];
    
    selectedFiles.forEach(file => {
      // Chercher une correspondance avec les éléments
      const matchedItem = findBestImageMatch(file.name, items);
      
      newMatches.push({
        file,
        item: matchedItem || null,
        status: matchedItem ? 'matched' : 'unmatched'
      });
    });
    
    setMatches(newMatches);
  };
  
  // Filtrer les correspondances en fonction de la recherche
  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const fileName = match.file.name.toLowerCase();
    const itemTitle = match.item?.title?.toLowerCase() || '';
    
    return fileName.includes(query) || itemTitle.includes(query);
  });
  
  // Associer manuellement un fichier à un élément
  const assignFileToItem = (fileIndex, itemId) => {
    const newMatches = [...matches];
    const selectedItem = items.find(item => item.id === itemId);
    
    if (selectedItem) {
      newMatches[fileIndex] = {
        ...newMatches[fileIndex],
        item: selectedItem,
        status: 'matched'
      };
      
      setMatches(newMatches);
    }
  };
  
  // Télécharger les images et mettre à jour les éléments
  const uploadImages = async () => {
    setIsUploading(true);
    setProgress(0);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      const matchedItems = matches.filter(match => match.status === 'matched' && match.item);
      const totalItems = matchedItems.length;
      
      // Pour chaque correspondance avec un élément
      for (let i = 0; i < matchedItems.length; i++) {
        const match = matchedItems[i];
        
        try {
          // Mettre à jour l'élément avec le fichier image
          await updateItem({
            id: match.item.id,
            imageFile: match.file
          });
          successCount++;
        } catch (err) {
          console.error(`Erreur lors de la mise à jour de l'image pour ${match.item.title}:`, err);
          errorCount++;
        }
        
        // Mettre à jour la progression
        setProgress(Math.round(((i + 1) / totalItems) * 100));
      }
      
      if (onSuccess) {
        onSuccess(`${successCount} images ont été téléchargées avec succès${errorCount > 0 ? ` (${errorCount} erreurs)` : ''}`);
      }
      
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors du téléchargement des images:', error);
      if (onError) {
        onError('Une erreur est survenue lors du téléchargement des images');
      }
      setProgress(0);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    }
  };
  
  // Réanalyser les images pour trouver de meilleures correspondances
  const reanalyzeMatches = () => {
    findMatchesForFiles(files);
  };
  
  if (!isOpen) {
    return (
      <button 
        className="bulk-image-button"
        onClick={openModal}
        title="Import d'images en masse"
      >
        <Image size={16} />
        <span>Import d'images</span>
      </button>
    );
  }
  
  return (
    <div className="bulk-image-overlay">
      <div className="bulk-image-modal">
        <div className="bulk-image-header">
          <h3>Import d'images en masse</h3>
          <button onClick={closeModal} className="modal-close-button">
            <X size={20} />
          </button>
        </div>
        
        <div className="bulk-image-content">
          {files.length === 0 ? (
            <div className="bulk-image-upload-zone">
              <div className="upload-icon">
                <Upload size={48} color="#97051D" />
              </div>
              <p>Sélectionnez plusieurs fichiers image à la fois</p>
              <p className="upload-info">Les noms de fichiers seront mis en correspondance avec les titres des éléments</p>
              <input 
                type="file" 
                id="bulk-images" 
                accept="image/*" 
                multiple 
                onChange={handleFilesSelected}
                className="file-input-hidden"
              />
              <label htmlFor="bulk-images" className="upload-button">
                <FolderOpen size={18} />
                <span>Sélectionner des images</span>
              </label>
            </div>
          ) : (
            <>
              <div className="bulk-image-toolbar">
                <div className="bulk-image-summary">
                  <div className="matches-count">
                    <span className="count-value">{matches.filter(m => m.status === 'matched').length}</span>
                    <span className="count-label">correspondances trouvées sur {files.length} fichiers</span>
                  </div>
                  
                  <button 
                    className="reanalyze-button"
                    onClick={reanalyzeMatches}
                    disabled={isUploading}
                  >
                    <RefreshCw size={14} />
                    <span>Réanalyser</span>
                  </button>
                </div>
                
                <div className="bulk-image-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                    disabled={isUploading}
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              
              {isUploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{progress}% Terminé</div>
                </div>
              )}
              
              <div className="bulk-image-matches">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((match, index) => (
                    <div key={index} className={`match-item ${match.status}`}>
                      <div className="match-file">
                        <div className="match-thumbnail">
                          <img src={URL.createObjectURL(match.file)} alt="Aperçu" />
                        </div>
                        <div className="match-file-info">
                          <div className="match-file-name">{match.file.name}</div>
                          <div className="match-file-size">{(match.file.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      
                      <div className="match-status">
                        {match.status === 'matched' ? (
                          <div className="match-success">
                            <Check size={16} />
                            <span>Associé à: {match.item.title}</span>
                          </div>
                        ) : (
                          <div className="match-selector">
                            <select 
                              onChange={(e) => assignFileToItem(matches.indexOf(match), e.target.value)}
                              className="item-selector"
                              value=""
                              disabled={isUploading}
                            >
                              <option value="" disabled>Sélectionner un élément...</option>
                              {items.map(item => (
                                <option key={item.id} value={item.id}>{item.title}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-matches">
                    <p>Aucune correspondance trouvée pour votre recherche</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="bulk-image-footer">
          <button 
            onClick={closeModal} 
            className="cancel-button"
            disabled={isUploading}
          >
            Annuler
          </button>
          
          {files.length > 0 && (
            <button 
              onClick={uploadImages} 
              className="upload-button"
              disabled={isUploading || matches.filter(m => m.status === 'matched').length === 0}
            >
              {isUploading ? 'Téléchargement...' : 'Télécharger les images'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImageUpload;