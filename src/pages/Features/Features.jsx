import './Features.css';

const FeaturesPage = () => {
  const popularFeatures = [
    "Advanced Search",
    "Real-Time Notifications",
    "Customizable Dashboard",
    "Offline Mode",
    "Multi-Device Sync"
  ];

  return (
    <div className="features-page">
      <h1 className="page-title">Features</h1>
      
      <div className="features-grid">
        <div className="add-content-card">
          <h3 className="section-title">Add New Content</h3>
          
          <form className="content-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="form-input" placeholder="Enter a title..." />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows="4" className="form-textarea" placeholder="Write a short description..."></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Image</label>
              <input type="file" className="form-file-input" />
            </div>
            
            <button className="submit-button">
              Submit
            </button>
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
    </div>
  );
};

export default FeaturesPage;
