// src/components/ImageCrop/ImageCrop.jsx
import { useState, useRef, useEffect } from 'react';
import { Crop, RotateCcw, Check, X, ZoomIn, ZoomOut } from 'lucide-react';
import './ImageCrop.css';

/**
 * Composant de recadrage d'image avancé
 * @param {Object} props
 * @param {File|Object} props.image - Fichier image ou objet avec une URL
 * @param {function} props.onComplete - Fonction appelée avec l'image recadrée (Blob)
 * @param {function} props.onCancel - Fonction appelée pour annuler l'opération
 * @param {number} props.aspectRatio - Ratio d'aspect souhaité (width/height) - null pour libre
 * @param {boolean} props.circularCrop - Si true, le recadrage sera circulaire
 * @param {string} props.minWidth - Largeur minimale pour le recadrage (ex: "100px")
 * @param {string} props.minHeight - Hauteur minimale pour le recadrage (ex: "100px")
 */
const ImageCrop = ({
  image,
  onComplete = () => {},
  onCancel = () => {},
  aspectRatio = null,
  circularCrop = false,
  minWidth = "100px",
  minHeight = "100px"
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const cropAreaRef = useRef(null);
  
  // Déterminer l'URL de l'image
  const imageUrl = image instanceof File 
    ? URL.createObjectURL(image) 
    : (image?.url || image);
  
  // Charger l'image et initialiser le recadrage
  useEffect(() => {
    if (imageUrl && imageRef.current) {
      const img = new Image();
      img.onload = () => {
        setImageSize({
          width: img.width,
          height: img.height
        });
        
        // Initialiser le cadre de recadrage
        initCropArea();
        
        setImageLoaded(true);
      };
      img.src = imageUrl;
    }
    
    return () => {
      // Nettoyer l'URL créée si nécessaire
      if (image instanceof File && imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl, aspectRatio]);
  
  // Initialiser le cadre de recadrage
  const initCropArea = () => {
    if (!containerRef.current || !imageRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const img = imageRef.current.getBoundingClientRect();
    
    let width, height;
    
    if (aspectRatio) {
      // Respecter le ratio d'aspect
      if (aspectRatio >= 1) {
        // Plus large que haut
        width = Math.min(img.width * 0.8, container.width * 0.8);
        height = width / aspectRatio;
      } else {
        // Plus haut que large
        height = Math.min(img.height * 0.8, container.height * 0.8);
        width = height * aspectRatio;
      }
    } else {
      // Recadrage libre
      width = img.width * 0.8;
      height = img.height * 0.8;
    }
    
    // S'assurer que la zone de recadrage est centrée et contenue dans l'image
    const x = (img.width - width) / 2;
    const y = (img.height - height) / 2;
    
    setCrop({
      x,
      y,
      width,
      height
    });
  };
  
  // Gérer le début du déplacement du cadre
  const handleMouseDown = (e) => {
    e.preventDefault();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    });
  };
  
  // Gérer le déplacement du cadre
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const img = imageRef.current.getBoundingClientRect();
    
    // Calculer la nouvelle position
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    // Limiter aux bords de l'image
    newX = Math.max(0, Math.min(newX, img.width - crop.width));
    newY = Math.max(0, Math.min(newY, img.height - crop.height));
    
    setCrop({
      ...crop,
      x: newX,
      y: newY
    });
  };
  
  // Terminer le déplacement
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Annuler le recadrage
  const handleCancel = () => {
    onCancel();
  };
  
  // Terminer le recadrage et retourner l'image recadrée
  const handleComplete = () => {
    if (!imageRef.current || !cropAreaRef.current) return;
    
    // Créer un canvas pour le recadrage
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculer les dimensions réelles
    const scaleX = imageSize.width / imageRef.current.offsetWidth;
    const scaleY = imageSize.height / imageRef.current.offsetHeight;
    
    // Définir les dimensions du canvas
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    // Appliquer la rotation si nécessaire
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // Dessiner l'image recadrée
    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    
    // Appliquer un masque circulaire si nécessaire
    if (circularCrop) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.fill();
    }
    
    // Convertir le canvas en blob et appeler le callback
    canvas.toBlob((blob) => {
      onComplete(blob);
    }, 'image/jpeg', 0.95);
  };
  
  // Zoomer/dézoomer
  const handleZoomChange = (delta) => {
    setZoom(Math.max(1, Math.min(3, zoom + delta)));
  };
  
  // Faire pivoter l'image
  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };
  
  return (
    <div className="image-crop-container">
      <div className="crop-header">
        <h3>Recadrer l'image</h3>
        <button onClick={handleCancel} className="cancel-button">
          <X size={24} />
        </button>
      </div>
      
      <div 
        className="crop-area-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="crop-image-container">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Image à recadrer"
            className="crop-image"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              opacity: imageLoaded ? 1 : 0
            }}
            draggable="false"
          />
          
          {imageLoaded && (
            <div 
              ref={cropAreaRef}
              className={`crop-area ${circularCrop ? 'circular' : ''}`}
              style={{
                left: `${crop.x}px`,
                top: `${crop.y}px`,
                width: `${crop.width}px`,
                height: `${crop.height}px`,
                minWidth,
                minHeight
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="crop-area-border"></div>
              <div className="crop-grid">
                <div className="crop-grid-line horizontal-1"></div>
                <div className="crop-grid-line horizontal-2"></div>
                <div className="crop-grid-line vertical-1"></div>
                <div className="crop-grid-line vertical-2"></div>
              </div>
              
              <div className="crop-area-handle top-left"></div>
              <div className="crop-area-handle top-right"></div>
              <div className="crop-area-handle bottom-left"></div>
              <div className="crop-area-handle bottom-right"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="crop-controls">
        <div className="crop-tools">
          <button 
            className="crop-tool-button"
            onClick={() => handleZoomChange(0.1)}
            title="Zoom in"
          >
            <ZoomIn size={20} />
          </button>
          <button 
            className="crop-tool-button"
            onClick={() => handleZoomChange(-0.1)}
            title="Zoom out"
          >
            <ZoomOut size={20} />
          </button>
          <button 
            className="crop-tool-button"
            onClick={handleRotate}
            title="Rotate 90°"
          >
            <RotateCcw size={20} />
          </button>
        </div>
        
        <div className="crop-actions">
          <button className="crop-button cancel" onClick={handleCancel}>
            Annuler
          </button>
          <button className="crop-button apply" onClick={handleComplete}>
            <Crop size={16} />
            <span>Appliquer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCrop;