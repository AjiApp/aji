// src/pages/Features/Features.jsx - Version améliorée
import { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, Download, Image, Edit2, Trash2, Plus, Info } from 'lucide-react';
import { 
  useFeatures, 
  useAddFeature, 
  useUpdateFeature, 
  useDeleteFeature 
} from '../../hooks/useFeatures';
import { exportToExcel, importFromExcel, prepareDataForExport, validateImportData } from '../../utils/excelUtils';
import BulkImageUpload from '../../components/BulkImageUpload/BulkImageUpload';
import ImageManager from '../../components/ImageManager/ImageManager';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import ImageCrop from '../../components/ImageCrop/ImageCrop';
import './Features.css';

const FeaturesPage = () => {
  // États locaux
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  
  // Référence pour le formulaire
  const formRef = useRef(null);

  // Hooks React Query
  const { 
    data: contents = [], 
    isLoading: isLoadingContents,
    isError: isErrorContents,
    error: contentsError
  } = useFeatures();
  
  const addFeature = useAddFeature();
  const updateFeature = useUpdateFeature();
  const deleteFeature = useDeleteFeature();

  // Fonctionnalités et caractéristiques populaires
  const popularFeatures = [
    "Gestion d'images avancée",
    "Import/Export Excel",
    "Interface responsive",
    "Mode sombre",
    "Authentification sécurisée"
  ];

  // Gestion des champs de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gestion du changement d'image
  const handleImageChange = (file) => {
    setFormData({
      ...formData,
      image: file
    });
    
    // Ouvrir l'éditeur de recadrage si un fichier est sélectionné
    if (file) {
      setSelectedImage(file);
      setShowCropper(true);
    }
  };
  
  // Gérer l'image recadrée
  const handleCroppedImage = (blob) => {
    // Convertir le blob en fichier
    const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
    
    setFormData({
      ...formData,
      image: croppedFile
    });
    
    // Créer l'URL de prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(blob);
    
    // Fermer le cropper
    setShowCropper(false);
  };
  
  // Annuler le recadrage
  const handleCancelCrop = () => {
    setShowCropper(false);
    setSelectedImage(null);
  };
  
  // Supprimer l'image
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setImagePreview(null);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editId) {
        // Mettre à jour une fonctionnalité existante
        await updateFeature.mutateAsync({
          id: editId,
          contentData: {
            title: formData.title,
            description: formData.description,
          },
          imageFile: formData.image
        });
        
        showNotification('Contenu mis à jour avec succès', 'success');
      } else {
        // Ajouter une nouvelle fonctionnalité
        await addFeature.mutateAsync({
          contentData: {
            title: formData.title,
            description: formData.description,
          },
          imageFile: formData.image
        });
        
        showNotification('Contenu ajouté avec succès', 'success');
      }
      
      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du contenu:", error);
      showNotification("Une erreur s'est produite", 'error');
    }
  };

  // Réinitialisation du formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: null
    });
    setImagePreview(null);
    setEditId(null);
    
    // Réinitialiser les champs de formulaire
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  // Modifier une fonctionnalité
  const handleEdit = (content) => {
    setFormData({
      title: content.title,
      description: content.description,
      image: null
    });
    setImagePreview(content.imageUrl);
    setEditId(content.id);
    
    // Scroll vers le formulaire
    formRef.current.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  // Supprimer une fonctionnalité
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await deleteFeature.mutateAsync(id);
        
        // Si en train d'éditer ce contenu, réinitialiser le formulaire
        if (editId === id) {
          resetForm();
        }
        
        showNotification('Contenu supprimé avec succès', 'success');
      } catch (error) {
        console.error("Erreur lors de la suppression du contenu:", error);
        showNotification("Une erreur s'est produite lors de la suppression", 'error');
      }
    }
  };

  // Annuler l'édition
  const cancelEdit = () => {
    resetForm();
  };

  // Afficher une notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // Gérer l'import Excel
  const handleImportExcel = async (importedData) => {
    try {
      // Ajouter chaque élément importé
      const promises = importedData.map(item => 
        addFeature.mutateAsync({
          contentData: {
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl || null, // Utiliser l'URL d'image importée
          },
          imageFile: null // Pas de fichier d'image, on utilise l'URL
        })
      );
      
      await Promise.all(promises);
      showNotification(`${importedData.length} éléments importés avec succès`, 'success');
      return true;
    } catch (error) {
      console.error("Erreur lors de l'import des fonctionnalités:", error);
      showNotification("Erreur lors de l'import", 'error');
      return false;
    }
  };
  
  // Mise à jour d'image en masse
  const handleBulkImageUpdate = async ({ id, imageFile }) => {
    try {
      // Mettre à jour l'élément avec la nouvelle image
      await updateFeature.mutateAsync({
        id,
        contentData: {},
        imageFile
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'image:", error);
      return false;
    }
  };
  
  // Afficher la galerie d'images
  const handleViewGallery = () => {
    // Préparer les images pour la galerie
    const images = contents.map(content => ({
      url: content.imageUrl,
      id: content.id,
      title: content.title
    }));
    
    setGalleryImages(images);
    setShowGallery(true);
  };
  
  // Fermer la galerie
  const handleCloseGallery = () => {
    setShowGallery(false);
  };
  
  // Modifier une image depuis la galerie
  const handleEditFromGallery = (image) => {
    const content = contents.find(c => c.id === image.id);
    if (content) {
      handleEdit(content);
    }
    setShowGallery(false);
  };
  
  // Supprimer une image depuis la galerie
  const handleDeleteFromGallery = (image) => {
    if (image.id) {
      handleDelete(image.id);
    }
  };

  // Si une erreur se produit lors du chargement
  if (isErrorContents) {
    return (
      <div className="features-page">
        <h1 className="page-title">Features</h1>
        <div className="error-message">
          Une erreur s'est produite: {contentsError.message}
        </div>
      </div>
    );
  }

  return (
    <div className="features-page">
      <h1 className="page-title">Features</h1>
      
      <div className="features-grid">
        <div className="add-content-card">
          <h3 className="section-title">
            {editId ? 'Edit Content' : 'Add New Content'}
          </h3>
          
          <form className="content-form" onSubmit={handleSubmit} ref={formRef}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input" 
                placeholder="Enter a title..." 
                required
                disabled={addFeature.isPending || updateFeature.isPending}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea 
                rows="4" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea" 
                placeholder="Write a short description..."
                required
                disabled={addFeature.isPending || updateFeature.isPending}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Image</label>
              
              <ImageManager
                currentImage={formData.image}
                currentImageUrl={imagePreview}
                onImageChange={handleImageChange}
                onImageRemove={handleRemoveImage}
                disabled={addFeature.isPending || updateFeature.isPending}
                placeholderText="Add an image (click to upload)"
              />
            </div>
            
            {/* Section Excel intégrée dans le formulaire */}
            <div className="form-excel-container">
              <div className="excel-buttons-form">
                <div className="excel-buttons-label">
                  <FileSpreadsheet size={18} />
                  <span>Excel Import/Export</span>
                </div>
                
                <div className="excel-buttons-actions">
                  <button 
                    className="excel-button export-button"
                    type="button"
                    onClick={() => {
                      const exportData = prepareDataForExport(contents, "features");
                      exportToExcel(exportData, "features-export", "Features");
                      showNotification('Export Excel réussi', 'success');
                    }}
                    disabled={addFeature.isPending || updateFeature.isPending || !contents?.length}
                    title="Export to Excel"
                  >
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                  
                  <label className="excel-button import-button" title="Import from Excel">
                    <Upload size={16} />
                    <span>Import</span>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls" 
                      className="file-input-hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        try {
                          const importedData = await importFromExcel(file);
                          const validation = validateImportData(importedData, "features");
                          
                          if (validation.isValid) {
                            await handleImportExcel(validation.data);
                            showNotification(`Import Excel réussi: ${validation.data.length} éléments importés`, 'success');
                          } else {
                            showNotification(`Erreurs dans le fichier Excel: ${validation.errors.join(', ')}`, 'error');
                          }
                        } catch (error) {
                          console.error('Import error:', error);
                          showNotification('Erreur lors de l\'import Excel', 'error');
                        } finally {
                          e.target.value = '';
                        }
                      }}
                      disabled={addFeature.isPending || updateFeature.isPending}
                    />
                  </label>
                  
                  {/* Bouton d'import d'images en masse */}
                  {contents && contents.length > 0 && (
                    <BulkImageUpload 
                      items={contents}
                      updateItem={handleBulkImageUpdate}
                      onSuccess={(msg) => showNotification(msg, 'success')}
                      onError={(msg) => showNotification(msg, 'error')}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              {editId ? (
                <>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={updateFeature.isPending}
                  >
                    {updateFeature.isPending ? 'Updating...' : 'Update'}
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="cancel-button"
                    disabled={updateFeature.isPending}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={addFeature.isPending}
                >
                  {addFeature.isPending ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
        
        <div className="features-column">
          <div className="popular-features-card">
            <h3 className="section-title">Popular Features</h3>
            
            <ul className="popular-features-list">
              {popularFeatures.map((feature, index) => (
                <li key={index} className="popular-feature-item">
                  <span className="feature-dot"></span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="image-management-card">
            <h3 className="section-title">Image Management</h3>
            
            <div className="image-tools">
              <button 
                className="image-tool-button"
                onClick={handleViewGallery}
                disabled={!contents?.length}
              >
                <Image size={18} />
                <span>View Image Gallery</span>
              </button>
              
              <div className="image-tool-info">
                <Info size={16} />
                <span>Manage, crop, and organize your images efficiently</span>
              </div>
            </div>
          </div>
          
          <div className="support-card">
            <h3 className="support-title">Need Help?</h3>
            <p className="support-text">
              Our support team is available 24/7 to assist you.
            </p>
            <button className="support-button">
              Contact Support
            </button>
          </div>
        </div>
      </div>
      
      {isLoadingContents ? (
        <div className="loading-container">
          <p>Loading content...</p>
        </div>
      ) : contents.length > 0 ? (
        <div className="content-list-section">
          <div className="content-list-header">
            <h2 className="content-list-title">Your Features</h2>
            
            <button 
              className="add-feature-button"
              onClick={() => formRef.current.scrollIntoView({ behavior: 'smooth' })}
            >
              <Plus size={16} />
              <span>Add Feature</span>
            </button>
          </div>
          
          <div className="content-cards">
            {contents.map((content) => (
              <div key={content.id} className="content-card">
                <div className="content-card-image">
                  <img src={content.imageUrl} alt={content.title} />
                  
                  <div className="image-overlay">
                    <div className="image-actions">
                      <button 
                        className="image-action edit"
                        onClick={() => handleEdit(content)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="image-action delete"
                        onClick={() => handleDelete(content.id)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="content-card-body">
                  <h3 className="content-card-title">{content.title}</h3>
                  <p className="content-card-description">{content.description}</p>
                  <div className="content-card-footer">
                    <span className="content-card-date">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </span>
                    <div className="content-card-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEdit(content)}
                        disabled={updateFeature.isPending || deleteFeature.isPending}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(content.id)}
                        disabled={deleteFeature.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-content-message">
          <p>No content added yet. Use the form above to add your first content.</p>
        </div>
      )}
      
      {/* Popup de recadrage d'image */}
      {showCropper && selectedImage && (
        <ImageCrop
          image={selectedImage}
          onComplete={handleCroppedImage}
          onCancel={handleCancelCrop}
          aspectRatio={16/9}
          circularCrop={false}
          minWidth="150px"
          minHeight="100px"
        />
      )}
      
      {/* Galerie d'images */}
      {showGallery && (
        <div className="gallery-overlay">
          <div className="gallery-container">
            <div className="gallery-header">
              <h3>Image Gallery</h3>
              <button className="gallery-close" onClick={handleCloseGallery}>
                <X size={24} />
              </button>
            </div>
            
            <div className="gallery-content">
              <ImageGallery
                images={galleryImages}
                onEdit={handleEditFromGallery}
                onDelete={handleDeleteFromGallery}
                showControls={true}
                height="500px"
              />
            </div>
          </div>
        </div>
      )}
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default FeaturesPage;