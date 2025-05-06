import React from 'react';
import './Home.css';

const Home = () => {
  const stats = [
    { label: 'Utilisateurs', value: '2,345', change: '+12%', icon: '👥' },
    { label: 'Événements', value: '42', change: '+5%', icon: '📅' },
    { label: 'Services', value: '18', change: '+2', icon: '🌐' },
  ];

  return (
    <div className="home-page">
      <div className="home-header">
        <h2>Tableau de bord</h2>
        <div className="home-date">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-title">{stat.label}</div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        ))}
      </div>
      
      {/* Bienvenue */}
      <div className="welcome-card">
        <h3 className="welcome-title">Bienvenue sur Super App</h3>
        <p className="welcome-text">
          Explorez nos différents services et fonctionnalités. Naviguez dans le
          menu pour tout découvrir. Notre application est optimisée pour vous offrir
          la meilleure expérience possible.
        </p>
        
        <div className="whats-new">
          <h4 className="whats-new-title">Quoi de neuf ?</h4>
          <ul className="whats-new-list">
            <li className="whats-new-item">
              Nouvelle fonctionnalité de recherche améliorée
            </li>
            <li className="whats-new-item">
              Mode sombre disponible
            </li>
            <li className="whats-new-item">
              Interface utilisateur redessinée pour plus de simplicité
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;