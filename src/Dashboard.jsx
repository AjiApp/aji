import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from './firebase/config';

const Dashboard = () => {
  // Vérifier si l'utilisateur est connecté
  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="dashboard">
      <h1>Tableau de Bord</h1>
      <p>Bienvenue, {auth.currentUser.email}</p>
      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  );
};

export default Dashboard;