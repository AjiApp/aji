// src/components/ImageGallery/ImageGallery.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Trash2, Edit2 } from 'lucide-react';
import './ImageGallery.css';

/**
 * Composant de galerie d'images avancé avec navigation, zoom et gestion
 * @param {Object} props
 * @param {Array<string|Object>} props.images - Liste des images (URLs ou objets avec url, title, etc.)
 * @param {function} props.onEdit - Fonction appelée pour éditer une image
 * @param {function} props.onDelete - Fonction appelée pour supprimer une image
 * @param {function} props.onAdd - Fonction appelée pour ajouter une image
 * @param {boolean} props.showControls - Affiche les contrôles d'édition si true
 * @param {string} props.height - Hauteur de la galerie (ex: '400px')
 */
const ImageGallery = ({ 
  images = [], 
  onEdit = null,
  onDelete = null,
  onAdd = null,
  showControls = false,
  height = '400px'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const galleryRef = useRef(null);
  const imageRef = useRef(null);
  
  // Normaliser les images pour avoir un format uniforme
  const normalizedImages = images.map(img => 
    typeof img === 'string' ? { url: img } : img
  );
  
  // Si aucune image n'est fournie, afficher un placeholder
  const hasImages = normalizedImages.length > 0;
  const currentImage = hasImages ? normalizedImages[currentIndex] : null;
  
  // Gérer les touches du clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === 'ArrowRight') {
          navigateNext();
        } else if (e.key === 'ArrowLeft') {
          navigatePrev();
        } else if (e.key === 'Escape') {
          setIsFullscreen(false);
          setIsZoomed(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentIndex]);

  // Naviguer à l'image précédente
  const navigatePrev = () => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? normalizedImages.length - 1 : prevIndex - 1
    );
    setIsZoomed(false);
  };

  // Naviguer à l'image suivante
  const navigateNext = () => {
    if (!hasImages) return;
    setCurrentIndex((prevIndex) => 
      prevIndex === normalizedImages.length - 1 ? 0 : prevIndex + 1
    );
    setIsZoomed(false);
  };

  // Basculer le zoom
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    if (isZoomed) {
      setDragOffset({ x: 0, y: 0 });
    }
  };
  
  // Basculer l'affichage plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (isFullscreen) {
      setIsZoomed(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };
  
  // Gestion du défilement tactile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      navigateNext();
    } else if (isRightSwipe) {
      navigatePrev();
    }
  };
  
  // Gestion du déplacement de l'image en mode zoom
  const handleMouseDown = (e) => {
    if (!isZoomed) return;
    
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    
    const handleMouseMove = (e) => {
      const newOffsetX = dragOffset.x + (e.clientX - startX);
      const newOffsetY = dragOffset.y + (e.clientY - startY);
      
      setDragOffset({
        x: newOffsetX,
        y: newOffsetY
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Télécharger l'image actuelle
  const downloadImage = () => {
    if (!currentImage) return;
    
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.title || `image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Éditer l'image actuelle
  const handleEdit = () => {
    if (onEdit && currentImage) {
      onEdit(currentImage, currentIndex);
    }
  };
  
  // Supprimer l'image actuelle
  const handleDelete = () => {
    if (onDelete && currentImage) {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
        onDelete(currentImage, currentIndex);
      }
    }
  };
  
  // Ajouter une nouvelle image
  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    }
  };
  
  return (
    <div 
      className={`image-gallery ${isFullscreen ? 'fullscreen' : ''}`} 
      ref={galleryRef}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Conteneur principal de l'image */}
      <div 
        className="gallery-main"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {hasImages ? (
          <div className={`gallery-image-container ${isZoomed ? 'zoomed' : ''}`}>
            <img
              ref={imageRef}
              src={currentImage.url}
              alt={currentImage.title || `Image ${currentIndex + 1}`}
              className="gallery-image"
              style={{
                transform: isZoomed ? `scale(2) translate(${dragOffset.x}px, ${dragOffset.y}px)` : 'scale(1)',
                cursor: isZoomed ? 'grab' : 'default'
              }}
              onMouseDown={handleMouseDown}
              onDoubleClick={toggleZoom}
            />
          </div>
        ) : (
          <div className="gallery-placeholder">
            <div className="placeholder-icon">🖼️</div>
            <p>Aucune image disponible</p>
            {onAdd && (
              <button className="btn-add-image" onClick={handleAdd}>
                Ajouter une image
              </button>
            )}
          </div>
        )}
        
        {/* Navigation */}
        {hasImages && normalizedImages.length > 1 && (
          <>
            <button 
              className="gallery-nav-button prev"
              onClick={navigatePrev}
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="gallery-nav-button next"
              onClick={navigateNext}
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Contrôles */}
        {hasImages && (
          <div className="gallery-controls">
            <button 
              className="gallery-control-button"
              onClick={toggleZoom}
              aria-label="Zoomer/Dézoomer"
            >
              <ZoomIn size={20} />
            </button>
            
            <button 
              className="gallery-control-button"
              onClick={downloadImage}
              aria-label="Télécharger"
            >
              <Download size={20} />
            </button>
            
            <button 
              className="gallery-control-button"
              onClick={toggleFullscreen}
              aria-label="Plein écran"
            >
              {isFullscreen ? <X size={20} /> : <span>⛶</span>}
            </button>
            
            {showControls && (
              <>
                <button 
                  className="gallery-control-button"
                  onClick={handleEdit}
                  aria-label="Modifier"
                  disabled={!onEdit}
                >
                  <Edit2 size={20} />
                </button>
                
                <button 
                  className="gallery-control-button delete"
                  onClick={handleDelete}
                  aria-label="Supprimer"
                  disabled={!onDelete}
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Vignettes */}
      {hasImages && normalizedImages.length > 1 && (
        <div className="gallery-thumbnails">
          {normalizedImages.map((image, index) => (
            <div 
              key={`thumbnail-${index}`}
              className={`gallery-thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                setIsZoomed(false);
              }}
            >
              <img 
                src={image.url} 
                alt={image.title || `Vignette ${index + 1}`} 
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Indicateur de pagination */}
      {hasImages && normalizedImages.length > 1 && (
        <div className="gallery-pagination">
          <span>{currentIndex + 1}</span> / <span>{normalizedImages.length}</span>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;