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
    history: '',
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const services = [
    { id: 'e-sim', name: 'E‑SIM', icon: '📱' },
    { id: 'visa', name: 'Visas', icon: '🛂' },
    { id: 'tickets', name: 'Tickets', icon: '🎫' },
    { id: 'flights', name: 'Flights', icon: '✈️' },
    { id: 'accommodation', name: 'Accommodation', icon: '🏨' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'visit', name: 'Visit Morocco', icon: '🏝️' },
    { id: 'food', name: 'Gastronomy', icon: '🍽️' },
    { id: 'contacts', name: 'Important Contacts', icon: '📞' },
  ];

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const locationsData = await getLocations();
        setLocations(locationsData);
      } catch (error) {
        console.error("Error loading locations:", error);
        showNotification('Error loading locations', 'error');
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
      alert(`You selected the service: ${serviceId}`);
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
        const updatedLocation = await updateLocation(
          editingId,
          {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            price: formData.price,
            history: formData.history
          },
          formData.image
        );
        setLocations(locations.map(location => 
          location.id === editingId ? updatedLocation : location
        ));
        showNotification('Location updated successfully', 'success');
      } else {
        const newLocation = await addLocation(
          {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            price: formData.price,
            history: formData.history
          },
          formData.image
        );
        setLocations([...locations, newLocation]);
        showNotification('Location added successfully', 'success');
      }
      resetForm();
    } catch (error) {
      console.error("Error saving location:", error);
      showNotification("An error occurred", 'error');
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
      history: location.history || '',
      image: null
    });
    setPreviewUrl(location.imageUrl);
    setEditingId(location.id);
    setShowForm(true);
    window.scrollTo({
      top: document.querySelector('.location-form-container').offsetTop - 20,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        setLoading(true);
        await deleteLocation(id);
        setLocations(locations.filter(location => location.id !== id));
        if (editingId === id) {
          resetForm();
        }
        showNotification('Location deleted successfully', 'success');
      } catch (error) {
        console.error("Error deleting location:", error);
        showNotification("An error occurred while deleting", 'error');
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
      history: '',
      image: null
    });
    setPreviewUrl(null);
    setEditingId(null);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', {
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
              {editingId ? 'Edit a Location' : 'Add a New Place to Visit'}
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
                      placeholder="Place name"
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
                      placeholder="Place description"
                      rows="4"
                      required
                      disabled={loading}
                    ></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">History</label>
                    <textarea
                      name="history"
                      value={formData.history}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Historical and cultural context"
                      rows="6"
                      disabled={loading}
                    ></textarea>
                  </div>
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
                      disabled={loading}
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
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                )}
              </div>
            </form>
          </div>

          {loading && locations.length === 0 ? (
            <div className="loading-container">
              <p>Loading locations...</p>
            </div>
          ) : locations.length > 0 ? (
            <div className="locations-container">
              <h2 className="section-title">Places to Visit in Morocco</h2>
              
              <div className="locations-grid">
                {locations.map((location) => (
                  <div key={location.id} className="location-card">
                    <div className="location-image">
                      <img src={location.imageUrl} alt={location.title} />
                    </div>
                    <div className="location-details">
                      <h3 className="location-title">{location.title}</h3>
                      <p className="location-description">{location.description}</p>
                      
                      {location.history && (
                        <div className="location-history">
                          <h4 className="history-title">History</h4>
                          <p className="history-text">{location.history}</p>
                        </div>
                      )}
                      
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
                        Added on {formatDate(location.createdAt)}
                      </div>
                      <div className="location-actions">
                        <button 
                          className="edit-button"
                          onClick={() => handleEdit(location)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(location.id)}
                          disabled={loading}
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
              <p>No places have been added yet. Use the form above to add your first place to visit.</p>
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
