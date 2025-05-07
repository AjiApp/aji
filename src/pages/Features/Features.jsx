import { useState, useEffect } from 'react';
// Importation directe du service Firebase
import { 
  getContents, 
  addContent, 
  updateContent, 
  deleteContent 
} from '../../firebase/firebase.service';
import './Features.css';

const FeaturesPage = () => {
  // État local pour stocker les contenus
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Charger les contenus au chargement du composant
  useEffect(() => {
    const loadContents = async () => {
      try {
        setLoading(true);
        const contentsData = await getContents();
        setContents(contentsData);
      } catch (error) {
        console.error("Erreur lors du chargement des contenus:", error);
        showNotification('Erreur lors du chargement des contenus', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadContents();
  }, []);

  const popularFeatures = [
    "Advanced Search",
    "Real-Time Notifications",
    "Customizable Dashboard",
    "Offline Mode",
    "Multi-Device Sync"
  ];

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
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editId) {
        // Mettre à jour le contenu existant
        const updatedContent = await updateContent(
          editId,
          {
            title: formData.title,
            description: formData.description,
          },
          formData.image
        );
        
        // Mettre à jour l'état local
        setContents(contents.map(content => 
          content.id === editId ? updatedContent : content
        ));
        
        showNotification('Contenu mis à jour avec succès', 'success');
      } else {
        // Ajouter un nouveau contenu
        const newContent = await addContent(
          {
            title: formData.title,
            description: formData.description,
          },
          formData.image
        );
        
        // Ajouter à l'état local
        setContents([newContent, ...contents]);
        
        showNotification('Contenu ajouté avec succès', 'success');
      }
      
      // Réinitialiser le formulaire
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du contenu:", error);
      showNotification("Une erreur s'est produite", 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: null
    });
    setImagePreview(null);
    setEditId(null);
  };

  const handleEdit = (content) => {
    setFormData({
      title: content.title,
      description: content.description,
      image: null
    });
    setImagePreview(content.imageUrl);
    setEditId(content.id);
    
    // Scroll to form
    document.querySelector('.add-content-card').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        setLoading(true);
        await deleteContent(id);
        
        // Mettre à jour l'état local
        setContents(contents.filter(content => content.id !== id));
        
        // Si en train d'éditer ce contenu, réinitialiser le formulaire
        if (editId === id) {
          resetForm();
        }
        
        showNotification('Contenu supprimé avec succès', 'success');
      } catch (error) {
        console.error("Erreur lors de la suppression du contenu:", error);
        showNotification("Une erreur s'est produite lors de la suppression", 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    resetForm();
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="features-page">
      <h1 className="page-title">Features</h1>
      
      <div className="features-grid">
        <div className="add-content-card">
          <h3 className="section-title">
            {editId ? 'Edit Content' : 'Add New Content'}
          </h3>
          
          <form className="content-form" onSubmit={handleSubmit}>
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
                disabled={loading}
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
                disabled={loading}
              ></textarea>
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
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            
            <div className="form-actions">
              {editId ? (
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
                    onClick={cancelEdit}
                    className="cancel-button"
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
                  {loading ? 'Submitting...' : 'Submit'}
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
      
      {loading && contents.length === 0 ? (
        <div className="loading-container">
          <p>Loading content...</p>
        </div>
      ) : contents.length > 0 ? (
        <div className="content-list-section">
          <h2 className="content-list-title">Your Features</h2>
          
          <div className="content-cards">
            {contents.map((content) => (
              <div key={content.id} className="content-card">
                <div className="content-card-image">
                  <img src={content.imageUrl} alt={content.title} />
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
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(content.id)}
                        disabled={loading}
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
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default FeaturesPage;