// src/components/ImageManager/ImageManager.jsx
import { useState, useRef } from 'react';
import { 
  Image, 
  Upload, 
  Trash2, 
  Edit2, 
  Camera, 
  X, 
  Check, 
  RefreshCw
} from 'lucide-react';
import './ImageManager.css';

/**
 * Composant de gestion d'images avec aperçu, upload et édition
 * @param {Object} props
 * @param {File|null} props.currentImage - Image actuelle (fichier)
 * @param {string|null} props.currentImageUrl - URL de l'image actuelle
 * @param {function} props.onImageChange - Fonction appelée lors du changement d'image
 * @param {function} props.onImageRemove - Fonction appelée lors de la suppression d'image
 * @param {boolean} props.disabled - Désactive les interactions si true
 * @param {string} props.placeholderText - Texte à afficher si aucune image n'est présente
 */
const ImageManager = ({
  currentImage,
  currentImageUrl,
  onImageChange,
  onImageRemove,
  disabled = false,
  placeholderText = "Ajouter une image"
}) => {
  const [hovering, setHovering] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl);
  const fileInputRef = useRef(null);
  
  // Ouvrir le sélecteur de fichier
  const handleSelectImage = () => {
    if (disabled) return;
    fileInputRef.current.click();
  };
  
  // Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Appeler le callback
    onImageChange(file);
  };
  
  // Supprimer l'image
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    if (disabled) return;
    
    setPreview(null);
    onImageRemove();
    
    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div 
      className={`image-manager ${disabled ? 'disabled' : ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div 
        className={`image-manager-container ${preview ? 'has-image' : ''}`}
        onClick={handleSelectImage}
      >
        {preview ? (
          <div className="image-preview-container">
            <img 
              src={preview} 
              alt="Aperçu" 
              className="image-preview"
            />
            
            {hovering && !disabled && (
              <div className="image-overlay">
                <div className="image-actions">
                  <button 
                    className="image-action-button edit"
                    onClick={handleSelectImage}
                    title="Modifier l'image"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className="image-action-button delete"
                    onClick={handleRemoveImage}
                    title="Supprimer l'image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="image-placeholder">
            <div className="placeholder-icon">
              <Camera size={32} color="#97051D" />
            </div>
            <p className="placeholder-text">{placeholderText}</p>
          </div>
        )}
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="file-input-hidden"
        onChange={handleImageChange}
        disabled={disabled}
      />
      
      {/* Boutons bas */}
      <div className="image-manager-buttons">
        <button 
          className="image-button upload-button"
          onClick={handleSelectImage}
          disabled={disabled}
        >
          <Upload size={16} />
          <span>{preview ? "Changer l'image" : "Ajouter une image"}</span>
        </button>
        
        {preview && (
          <button 
            className="image-button remove-button"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageManager;