import './Features.css';

const FeaturesPage = () => {
  const popularFeatures = [
    "Recherche avancée",
    "Notifications en temps réel",
    "Tableau de bord personnalisable",
    "Mode hors ligne",
    "Synchronisation multi-appareils"
  ];

  return (
    <div className="features-page">
      <h1 className="page-title">Fonctionnalités</h1>
      
      <div className="features-grid">
        <div className="add-content-card">
          <h3 className="section-title">Ajouter un contenu</h3>
          
          <form className="content-form">
            <div className="form-group">
              <label className="form-label">Titre</label>
              <input type="text" className="form-input" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows="4" className="form-textarea"></textarea>
            </div>
            
            <div className="form-group">
              <label className="form-label">Image</label>
              <input type="file" className="form-file-input" />
            </div>
            
            <button className="submit-button">
              Soumettre
            </button>
          </form>
        </div>
        
        <div className="features-column">
          <div className="popular-features-card">
            <h3 className="section-title">Fonctionnalités populaires</h3>
            
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
            <h3 className="support-title">Besoin d'aide ?</h3>
            <p className="support-text">
              Notre équipe de support est disponible 24/7 pour vous aider
            </p>
            <button className="support-button">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;