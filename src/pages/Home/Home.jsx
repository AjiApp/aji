import './Home.css';

const HomePage = () => {
  const stats = [
    { label: 'Utilisateurs', value: '2,345', change: '+12%', icon: '👥' },
    { label: 'Événements', value: '42', change: '+5%', icon: '📅' },
    { label: 'Services', value: '18', change: '+2', icon: '🌐' }
  ];

  const newFeatures = [
    'Nouvelle fonctionnalité de recherche améliorée',
    'Mode sombre disponible',
    'Interface utilisateur redessinée pour plus de simplicité'
  ];

  return (
    <div className="home-page">
      <h1 className="page-title">Tableau de bord</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>
      
      <div className="welcome-card">
        <h2 className="welcome-title">Bienvenue sur Super App</h2>
        <p className="welcome-text">
          Explorez nos différents services et fonctionnalités. Naviguez dans le
          menu pour tout découvrir. Notre application est optimisée pour vous offrir
          la meilleure expérience possible.
        </p>
        
        <div className="whats-new">
          <h3 className="whats-new-title">Quoi de neuf ?</h3>
          <ul className="features-list">
            {newFeatures.map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-bullet"></span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;