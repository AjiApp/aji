import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import './Features.css';

const FeaturesPage = () => {
  const { contents, addContent, updateContent, deleteContent } = useAppContext();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  });
  const [editIndex, setEditIndex] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create content object with unique ID
    const contentItem = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      imageUrl: imagePreview || '/api/placeholder/400/200',
      createdAt: new Date().toLocaleDateString()
    };
    
    if (editIndex !== null) {
      // Update existing content
      updateContent(editIndex, contentItem);
      setEditIndex(null);
    } else {
      // Add new content
      addContent(contentItem);
    }
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: null
    });
    setImagePreview(null);
  };

  const handleEdit = (index) => {
    const contentToEdit = contents[index];
    setFormData({
      title: contentToEdit.title,
      description: contentToEdit.description,
      image: null
    });
    setImagePreview(contentToEdit.imageUrl);
    setEditIndex(index);
    
    // Scroll to form
    document.querySelector('.add-content-card').scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      deleteContent(index);
      
      // If editing the deleted content, reset form
      if (editIndex === index) {
        resetForm();
        setEditIndex(null);
      }
    }
  };

  const cancelEdit = () => {
    resetForm();
    setEditIndex(null);
  };

  return (
    <div className="features-page">
      <h1 className="page-title">Features</h1>
      
      <div className="features-grid">
        <div className="add-content-card">
          <h3 className="section-title">
            {editIndex !== null ? 'Edit Content' : 'Add New Content'}
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
              ></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="form-file-input" 
              />
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            
            <div className="form-actions">
              {editIndex !== null ? (
                <>
                  <button type="submit" className="submit-button">
                    Update
                  </button>
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button type="submit" className="submit-button">
                  Submit
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
      
      {contents.length > 0 && (
        <div className="content-list-section">
          <h2 className="content-list-title">Your Content</h2>
          
          <div className="content-cards">
            {contents.map((content, index) => (
              <div key={content.id} className="content-card">
                <div className="content-card-image">
                  <img src={content.imageUrl} alt={content.title} />
                </div>
                <div className="content-card-body">
                  <h3 className="content-card-title">{content.title}</h3>
                  <p className="content-card-description">{content.description}</p>
                  <div className="content-card-footer">
                    <span className="content-card-date">{content.createdAt}</span>
                    <div className="content-card-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEdit(index)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(index)}
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
      )}
    </div>
  );
};

export default FeaturesPage;