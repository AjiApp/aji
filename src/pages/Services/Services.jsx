import { useState, useEffect } from 'react';
import { 
  getLocations, 
  addLocation, 
  updateLocation, 
  deleteLocation 
} from '../../firebase/firebase.service';
import './Services.css';

const Services = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const services = [
    { id: 'e-sim', name: 'E‑SIM', icon: '📱' },
    { id: 'visa', name: 'Visas', icon: '🛂' },
    { id: 'tickets', name: 'Billets', icon: '🎫' },
    { id: 'flights', name: 'Vols', icon: '✈️' },
    { id: 'accommodation', name: 'Hébergement', icon: '🏨' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'visit', name: 'Visiter le Maroc', icon: '🏝️' },
    { id: 'food', name: 'Gastronomie', icon: '🍽️' },
    { id: 'contacts', name: 'Contacts importants', icon: '📞' },
  ];

  // Charger les lieux depuis Firebase au chargement du composant
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const locationsData = await getLocations();
        setLocations(locationsData);
      } catch (error) {
        console.error("Erreur lors du chargement des lieux:", error);
        showNotification('Erreur lors du chargement des lieux', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleServiceClick = (serviceId) => {
    if (serviceId === 'visit') {
      setShowForm(true);
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      console.log(`Service clicked: ${serviceId}`);
      alert(`Vous avez sélectionné le service: ${serviceId}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Créer une prévisualisation de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      if (editingId) {
        // Mise à jour d'un lieu existant
        const updatedLocation = await updateLocation(
          editingId,
          {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            price: formData.price
          },
          formData.image
        );
        
        // Mettre à jour le state local
        setLocations(locations.map(location => 
          location.id === editingId ? updatedLocation : location
        ));
        
        showNotification('Lieu mis à jour avec succès', 'success');
      } else {
        // Ajout d'un nouveau lieu
        const newLocation = await addLocation(
          {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            price: formData.price
          },
          formData.image
        );
        
        // Ajouter au state local
        setLocations([...locations, newLocation]);
        
        showNotification('Lieu ajouté avec succès', 'success');
      }
      
      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du lieu:", error);
      showNotification("Une erreur s'est produite", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location) => {
    setFormData({
      title: location.title,
      description: location.description,
      location: location.location,
      price: location.price,
      image: null
    });
    setPreviewUrl(location.imageUrl);
    setEditingId(location.id);
    
    // S'assurer que le formulaire est visible
    setShowForm(true);
    
    // Défilement vers le formulaire
    window.scrollTo({
      top: document.querySelector('.location-form-container').offsetTop - 20,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        setLoading(true);
        await deleteLocation(id);
        
        // Mettre à jour le state local
        setLocations(locations.filter(location => location.id !== id));
        
        // Si en train d'éditer ce lieu, réinitialiser le formulaire
        if (editingId === id) {
          resetForm();
        }
        
        showNotification('Lieu supprimé avec succès', 'success');
      } catch (error) {
        console.error("Erreur lors de la suppression du lieu:", error);
        showNotification("Une erreur s'est produite lors de la suppression", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      price: '',
      image: null
    });
    setPreviewUrl(null);
    setEditingId(null);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    // Faire disparaître la notification après 3 secondes
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Formatter la date pour l'affichage
  const formatDate = (date) => {
    if (!date) return '';
    
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="page-container services-page">
      <h1 className="page-title">Services</h1>
      
      <div className="services-grid">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="service-card"
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

      {showForm && (
        <div className="section-container">
          <div className="location-form-container">
            <h2 className="section-title">
              {editingId ? 'Modifier un lieu' : 'Ajouter un nouveau lieu à visiter'}
            </h2>
            
            <form onSubmit={handleSubmit} className="location-form">
              <div className="form-grid">
                <div className="form-left">
                  <div className="form-group">
                    <label className="form-label">Titre</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Nom du lieu"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Description du lieu"
                      rows="4"
                      required
                      disabled={loading}
                    ></textarea>
                  </div>
                </div>
                
                <div className="form-right">
                  <div className="form-group">
                    <label className="form-label">Localisation</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ville, région"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Prix</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ex: 100 MAD ou Gratuit"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="form-file-input"
                      disabled={loading}
                    />
                    
                    {previewUrl && (
                      <div className="image-preview">
                        <img src={previewUrl} alt="Aperçu" />
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
                      disabled={loading}
                    >
                      {loading ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Ajout en cours...' : 'Ajouter'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {loading && locations.length === 0 ? (
            <div className="loading-container">
              <p>Chargement des lieux...</p>
            </div>
          ) : locations.length > 0 ? (
            <div className="locations-container">
              <h2 className="section-title">Lieux à visiter au Maroc</h2>
              
              <div className="locations-grid">
                {locations.map((location) => (
                  <div key={location.id} className="location-card">
                    <div className="location-image">
                      <img src={location.imageUrl} alt={location.title} />
                    </div>
                    <div className="location-details">
                      <h3 className="location-title">{location.title}</h3>
                      <p className="location-description">{location.description}</p>
                      <div className="location-meta">
                        <div className="location-place">
                          <span className="meta-icon">📍</span>
                          <span>{location.location}</span>
                        </div>
                        <div className="location-price">
                          <span className="meta-icon">💰</span>
                          <span>{location.price}</span>
                        </div>
                      </div>
                      <div className="location-date">
                        Ajouté le {formatDate(location.createdAt)}
                      </div>
                      <div className="location-actions">
                        <button 
                          className="edit-button"
                          onClick={() => handleEdit(location)}
                          disabled={loading}
                        >
                          Modifier
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(location.id)}
                          disabled={loading}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-locations-message">
              <p>Aucun lieu n'a encore été ajouté. Utilisez le formulaire ci-dessus pour ajouter votre premier lieu à visiter.</p>
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