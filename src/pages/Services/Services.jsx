// src/pages/Services/Services.jsx - Version améliorée
import { useState, useRef, useEffect } from 'react';
import { FileSpreadsheet, Upload, Download, Image, Edit2, Trash2, Plus, CheckCircle, RefreshCw } from 'lucide-react';
import { 
  // Importer les APIs
  locationsApi, 
  accommodationsApi, 
  stadiumsApi
} from '../../api';
import { exportToExcel, importFromExcel, prepareDataForExport, validateImportData } from '../../utils/excelUtils';
import BulkImageUpload from '../../components/BulkImageUpload/BulkImageUpload';
import ImageManager from '../../components/ImageManager/ImageManager';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import ImageCrop from '../../components/ImageCrop/ImageCrop';
import './Services.css';

const Services = () => {
  // États locaux
  const [activeService, setActiveService] = useState(null);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    history: '',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [successSubmit, setSuccessSubmit] = useState(false);
  const [recentlyAddedItem, setRecentlyAddedItem] = useState(null);
  
  // Références pour le scroll automatique
  const formRef = useRef(null);
  const previewSectionRef = useRef(null);
  
  // États pour les données et le chargement
  const [serviceData, setServiceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  // Services disponibles
  const services = [
    { id: 'e-sim', name: 'E‑SIM', icon: '📱' },
    { id: 'visa', name: 'Visas', icon: '🛂' },
    { id: 'tickets', name: 'Tickets', icon: '🎫' },
    { id: 'flights', name: 'Flights', icon: '✈️' },
    { id: 'accommodation', name: 'Accommodation', icon: '🏨', hasForm: true },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'visit', name: 'Visit Morocco', icon: '🏝️', hasForm: true },
    { id: 'food', name: 'Gastronomy', icon: '🍽️' },
    { id: 'contacts', name: 'Important Contacts', icon: '📞' },
    { id: 'stadiums', name: 'Stadiums', icon: '🏟️', hasForm: true }
  ];

  // Effet pour faire défiler vers l'élément ajouté récemment
  useEffect(() => {
    if (successSubmit && recentlyAddedItem && previewSectionRef.current) {
      previewSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Réinitialiser le statut de succès après un certain temps
      const timer = setTimeout(() => {
        setSuccessSubmit(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successSubmit, recentlyAddedItem]);

  // Obtenir l'API correspondant à la catégorie active
  const getActiveApi = () => {
    switch(activeService) {
      case 'accommodation':
        return accommodationsApi;
      case 'stadiums':
        return stadiumsApi;
      case 'visit':
      default:
        return locationsApi;
    }
  };

  // Sélection d'un service
  const handleServiceClick = async (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    
    if (service?.hasForm) {
      setActiveService(serviceId);
      resetForm();
      
      // Charger les données correspondantes
      setIsLoading(true);
      setIsError(false);
      
      try {
        let api;
        switch(serviceId) {
          case 'accommodation':
            api = accommodationsApi;
            break;
          case 'stadiums':
            api = stadiumsApi;
            break;
          case 'visit':
          default:
            api = locationsApi;
            break;
        }
        
        const data = await api.getAll();
        setServiceData(data);
      } catch (err) {
        console.error(`Erreur lors du chargement des données ${serviceId}:`, err);
        setIsError(true);
        setError(err);
      } finally {
        setIsLoading(false);
      }
      
      // Scroll to form section
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      console.log(`Service clicked: ${serviceId}`);
      alert(`You selected the service: ${serviceId}`);
    }
  };

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
      setPreviewUrl(reader.result);
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
    setPreviewUrl(null);
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Obtenir l'API active
    const api = getActiveApi();
    setIsMutating(true);
    
    try {
      let result;
      
      if (editingId) {
        // Mettre à jour un élément existant
        const dataParam = activeService === 'accommodation' 
          ? { accommodationData: formData, id: editingId, imageFile: formData.image }
          : activeService === 'stadiums'
            ? { stadiumData: formData, id: editingId, imageFile: formData.image }
            : { locationData: formData, id: editingId, imageFile: formData.image };
        
        result = await api.update(dataParam);
        
        showNotification(`${getFormTitle()} updated successfully`, 'success');
      } else {
        // Ajouter un nouvel élément
        const dataParam = activeService === 'accommodation' 
          ? { accommodationData: formData, imageFile: formData.image }
          : activeService === 'stadiums'
            ? { stadiumData: formData, imageFile: formData.image }
            : { locationData: formData, imageFile: formData.image };
        
        result = await api.create(dataParam);
        
        showNotification(`${getFormTitle()} added successfully`, 'success');
        
        // Définir l'élément récemment ajouté pour l'affichage
        setRecentlyAddedItem(result);
        setSuccessSubmit(true);
      }
      
      // Recharger les données
      const data = await api.getAll();
      setServiceData(data);
      
      resetForm();
    } catch (error) {
      console.error("Error saving data:", error);
      showNotification("An error occurred", 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Modifier un élément
  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      location: item.location,
      price: item.price,
      history: item.history || '',
      image: null
    });
    setPreviewUrl(item.imageUrl);
    setEditingId(item.id);
    
    // Scroll vers le formulaire
    if (formRef.current) {
      formRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  // Supprimer un élément
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setIsMutating(true);
      
      try {
        const api = getActiveApi();
        await api.delete(id);
        
        // Recharger les données
        const data = await api.getAll();
        setServiceData(data);
        
        // Si en train d'éditer cet élément, réinitialiser le formulaire
        if (editingId === id) {
          resetForm();
        }
        
        // Si c'est l'élément récemment ajouté, le supprimer aussi
        if (recentlyAddedItem && recentlyAddedItem.id === id) {
          setRecentlyAddedItem(null);
          setSuccessSubmit(false);
        }
        
        showNotification(`${getFormTitle()} deleted successfully`, 'success');
      } catch (error) {
        console.error("Error deleting item:", error);
        showNotification("An error occurred while deleting", 'error');
      } finally {
        setIsMutating(false);
      }
    }
  };

  // Réinitialisation du formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: '',
      history: '',
      image: null
    });
    setPreviewUrl(null);
    setEditingId(null);
    
    // Réinitialiser le formulaire HTML
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  // Titre du formulaire selon le service sélectionné
  const getFormTitle = () => {
    switch(activeService) {
      case 'accommodation':
        return 'Accommodation';
      case 'visit':
        return 'Place to Visit';
      case 'stadiums':
        return 'Stadium';
      default:
        return 'Item';
    }
  };

  // Afficher une notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Formater une date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Gérer l'import Excel
  const handleImportExcel = async (importedData) => {
    try {
      const api = getActiveApi();
      
      // Créer le type de données approprié selon le service
      const dataType = activeService === 'accommodation' 
        ? 'accommodationData' 
        : activeService === 'stadiums' 
          ? 'stadiumData' 
          : 'locationData';
      
      // Ajouter chaque élément importé
      const promises = importedData.map(item => {
        // Préparer les données avec l'URL d'image si disponible
        const itemData = {
          ...item,
          imageUrl: item.imageUrl || null, // Utiliser l'URL d'image importée
          category: activeService // Assurer la catégorie correcte
        };
        
        // Créer le paramètre selon le type de service
        const param = {};
        param[dataType] = itemData;
        
        return api.create(param);
      });
      
      await Promise.all(promises);
      
      // Recharger les données
      const newData = await api.getAll();
      setServiceData(newData);
      
      showNotification(`${importedData.length} éléments importés avec succès`, 'success');
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'import ${activeService}:`, error);
      showNotification("Erreur lors de l'import", 'error');
      return false;
    }
  };
  
  // Mise à jour d'image en masse
  const handleBulkImageUpdate = async ({ id, imageFile }) => {
    try {
      // Obtenir l'API active
      const api = getActiveApi();
      
      // Préparer les paramètres selon le type de service
      const dataParam = activeService === 'accommodation' 
        ? { accommodationData: {}, id, imageFile }
        : activeService === 'stadiums'
          ? { stadiumData: {}, id, imageFile }
          : { locationData: {}, id, imageFile };
      
      // Mettre à jour l'élément avec la nouvelle image
      await api.update(dataParam);
      
      // Recharger les données après la mise à jour
      const newData = await api.getAll();
      setServiceData(newData);
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'image:", error);
      return false;
    }
  };
  
  // Afficher la galerie d'images
  const handleViewGallery = () => {
    // Préparer les images pour la galerie
    const images = serviceData.map(item => ({
      url: item.imageUrl,
      id: item.id,
      title: item.title
    }));
    
    setGalleryImages(images);
    setShowGallery(true);
  };
  
  // Gérer l'édition depuis la galerie
  const handleEditFromGallery = (image) => {
    const item = serviceData.find(i => i.id === image.id);
    if (item) {
      handleEdit(item);
    }
    setShowGallery(false);
  };
  
  // Gérer la suppression depuis la galerie
  const handleDeleteFromGallery = (image) => {
    if (image.id) {
      handleDelete(image.id);
    }
  };

  // Si une erreur se produit lors du chargement
  if (isError && activeService) {
    return (
      <div className="page-container services-page">
        <h1 className="page-title">Services</h1>
        <div className="error-message">
          Une erreur s'est produite: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container services-page">
      <h1 className="page-title">Services</h1>
      
      <div className="services-grid">
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`service-card ${activeService === service.id ? 'active' : ''}`}
            onClick={() => handleServiceClick(service.id)}
          >
            <div className="service-content">
              <div className="service-info">
                <span className="service-icon">{service.icon}</span>
                <span className="service-name">{service.name}</span>
              </div>
              <span className="service-arrow">→</span>
            </div>
          </div>
        ))}
      </div>

      {activeService && (
        <div className="section-container">
          {/* Affichage de l'élément récemment ajouté */}
          {successSubmit && recentlyAddedItem && (
            <div className="recently-added-section" ref={previewSectionRef}>
              <div className="section-header">
                <h2 className="section-title">
                  <CheckCircle size={20} className="success-icon" />
                  Recently Added {getFormTitle()}
                </h2>
                <button 
                  className="refresh-button"
                  onClick={() => {
                    setSuccessSubmit(false);
                    setRecentlyAddedItem(null);
                    
                    // Scroll vers le formulaire pour ajouter un nouvel élément
                    if (formRef.current) {
                      formRef.current.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Add Another</span>
                </button>
              </div>
              
              <div className="recently-added-item">
                <div className="item-image">
                  <img src={recentlyAddedItem.imageUrl} alt={recentlyAddedItem.title} />
                </div>
                <div className="item-details">
                  <h3 className="item-title">{recentlyAddedItem.title}</h3>
                  <p className="item-description">{recentlyAddedItem.description}</p>
                  
                  <div className="item-meta">
                    <div className="item-location">
                      <span className="meta-icon">📍</span>
                      <span>{recentlyAddedItem.location}</span>
                    </div>
                    {recentlyAddedItem.price && (
                      <div className="item-price">
                        <span className="meta-icon">💰</span>
                        <span>{recentlyAddedItem.price}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      className="edit-button"
                      onClick={() => handleEdit(recentlyAddedItem)}
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button 
                      className="view-gallery-button"
                      onClick={handleViewGallery}
                    >
                      <Image size={16} />
                      <span>View Gallery</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="location-form-container" ref={formRef}>
            <h2 className="section-title">
              {editingId ? `Edit ${getFormTitle()}` : `Add New ${getFormTitle()}`}
            </h2>
            
            <form onSubmit={handleSubmit} className="location-form">
              <div className="form-grid">
                <div className="form-left">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder={`${getFormTitle()} name`}
                      required
                      disabled={isMutating}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder={`${getFormTitle()} description`}
                      rows="4"
                      required
                      disabled={isMutating}
                    ></textarea>
                  </div>
                  
                  {activeService === 'visit' && (
                    <div className="form-group">
                      <label className="form-label">History</label>
                      <textarea
                        name="history"
                        value={formData.history}
                        onChange={handleInputChange}
                        className="form-textarea"
                        placeholder="Historical and cultural context"
                        rows="6"
                        disabled={isMutating}
                      ></textarea>
                    </div>
                  )}
                </div>
                
                <div className="form-right">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="City, region"
                      required
                      disabled={isMutating}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ex: 100 MAD or Free"
                      disabled={isMutating}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Image</label>
                    <ImageManager
                      currentImage={formData.image}
                      currentImageUrl={previewUrl}
                      onImageChange={handleImageChange}
                      onImageRemove={handleRemoveImage}
                      disabled={isMutating}
                      placeholderText="Add an image (click to upload)"
                    />
                  </div>
                </div>
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
                        const exportData = prepareDataForExport(
                          serviceData, 
                          activeService === 'accommodation' ? 'accommodations' : 
                          activeService === 'stadiums' ? 'stadiums' : 'locations'
                        );
                        exportToExcel(exportData, `${activeService}-export`, getFormTitle());
                        showNotification('Export Excel réussi', 'success');
                      }}
                      disabled={isMutating || !serviceData?.length}
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
                            const validation = validateImportData(
                              importedData, 
                              activeService === 'accommodation' ? 'accommodations' : 
                              activeService === 'stadiums' ? 'stadiums' : 'locations'
                            );
                            
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
                        disabled={isMutating}
                      />
                    </label>
                    
                    {/* Bouton d'import d'images en masse */}
                    {serviceData && serviceData.length > 0 && (
                      <BulkImageUpload 
                        items={serviceData}
                        updateItem={handleBulkImageUpdate}
                        onSuccess={(msg) => showNotification(msg, 'success')}
                        onError={(msg) => showNotification(msg, 'error')}
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                {editingId ? (
                  <>
                    <button 
                      type="submit" 
                      className="submit-button"
                      disabled={isMutating}
                    >
                      {isMutating ? 'Updating...' : 'Update'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={resetForm}
                      disabled={isMutating}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isMutating}
                  >
                    {isMutating ? 'Adding...' : 'Add'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <p>Loading {getFormTitle().toLowerCase()}...</p>
            </div>
          ) : serviceData.length > 0 ? (
            <div className="locations-container">
              <div className="locations-header">
                <h2 className="section-title">
                  {activeService === 'accommodation' && 'Accommodations in Morocco'}
                  {activeService === 'visit' && 'Places to Visit in Morocco'}
                  {activeService === 'stadiums' && 'Stadiums in Morocco'}
                </h2>
                
                <button 
                  className="view-gallery-button"
                  onClick={handleViewGallery}
                  disabled={!serviceData?.length}
                >
                  <Image size={16} />
                  <span>View Image Gallery</span>
                </button>
              </div>
              
              <div className="locations-grid">
                {serviceData.map((item) => (
                  <div key={item.id} className="location-card">
                    <div className="location-image">
                      <img src={item.imageUrl} alt={item.title} />
                      
                      <div className="image-overlay">
                        <div className="image-actions">
                          <button 
                            className="image-action edit"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className="image-action delete"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="location-details">
                      <h3 className="location-title">{item.title}</h3>
                      <p className="location-description">{item.description}</p>
                      
                      {item.history && (
                        <div className="location-history">
                          <h4 className="history-title">History</h4>
                          <p className="history-text">{item.history}</p>
                        </div>
                      )}
                      
                      <div className="location-meta">
                        <div className="location-place">
                          <span className="meta-icon">📍</span>
                          <span>{item.location}</span>
                        </div>
                        <div className="location-price">
                          <span className="meta-icon">💰</span>
                          <span>{item.price}</span>
                        </div>
                      </div>
                      <div className="location-date">
                        Added on {formatDate(item.createdAt)}
                      </div>
                      <div className="location-actions">
                        <button 
                          className="edit-button"
                          onClick={() => handleEdit(item)}
                          disabled={isMutating}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isMutating}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-locations-message">
              <p>No {getFormTitle().toLowerCase()} has been added yet. Use the form above to add your first item.</p>
            </div>
          )}
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
              <button className="gallery-close" onClick={() => setShowGallery(false)}>
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

export default Services;