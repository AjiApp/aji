import { useState } from 'react';
import { 
  useFeatures, 
  useAddFeature, 
  useUpdateFeature, 
  useDeleteFeature 
} from '../../hooks/useFeatures';
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
    "Advanced Search",
    "Real-Time Notifications",
    "Customizable Dashboard",
    "Offline Mode",
    "Multi-Device Sync"
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Créer l'URL de prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
    document.querySelector('.add-content-card').scrollIntoView({ 
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
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="form-file-input"
                disabled={addFeature.isPending || updateFeature.isPending}
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
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default FeaturesPage;