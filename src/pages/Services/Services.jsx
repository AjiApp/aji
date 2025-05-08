import { useState } from 'react';
import { 
  // Importer les nouveaux APIs
  locationsApi, 
  accommodationsApi, 
  stadiumsApi
} from '../../api';
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
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Obtenir l'API active
    const api = getActiveApi();
    setIsMutating(true);
    
    try {
      if (editingId) {
        // Mettre à jour un élément existant
        const dataParam = activeService === 'accommodation' 
          ? { accommodationData: formData, id: editingId, imageFile: formData.image }
          : activeService === 'stadiums'
            ? { stadiumData: formData, id: editingId, imageFile: formData.image }
            : { locationData: formData, id: editingId, imageFile: formData.image };
        
        await api.update(dataParam);
        
        showNotification(`${getFormTitle()} updated successfully`, 'success');
      } else {
        // Ajouter un nouvel élément
        const dataParam = activeService === 'accommodation' 
          ? { accommodationData: formData, imageFile: formData.image }
          : activeService === 'stadiums'
            ? { stadiumData: formData, imageFile: formData.image }
            : { locationData: formData, imageFile: formData.image };
        
        await api.create(dataParam);
        
        showNotification(`${getFormTitle()} added successfully`, 'success');
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
    window.scrollTo({
      top: document.querySelector('.location-form-container').offsetTop - 20,
      behavior: 'smooth'
    });
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
          <div className="location-form-container">
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="form-file-input"
                      disabled={isMutating}
                    />
                    
                    {previewUrl && (
                      <div className="image-preview">
                        <img src={previewUrl} alt="Preview" />
                      </div>
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
              <h2 className="section-title">
                {activeService === 'accommodation' && 'Accommodations in Morocco'}
                {activeService === 'visit' && 'Places to Visit in Morocco'}
                {activeService === 'stadiums' && 'Stadiums in Morocco'}
              </h2>
              
              <div className="locations-grid">
                {serviceData.map((item) => (
                  <div key={item.id} className="location-card">
                    <div className="location-image">
                      <img src={item.imageUrl} alt={item.title} />
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
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Services;