import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useNotification } from './contexts/NotificationContext';
import './login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  // Utiliser notre hook personnalisé pour l'authentification
  const { user, loading, error, signIn, resetPassword } = useAuth();
  
  // Utiliser le contexte de notification pour les messages
  const { showSuccess, showError } = useNotification();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Afficher les erreurs d'authentification
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  // Gérer la soumission du formulaire
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    
    const success = await signIn(email, password);
    if (success) {
      // La redirection se fait automatiquement grâce au useEffect qui surveille user
    }
  };

  // Gérer la réinitialisation du mot de passe
  const handlePasswordReset = async () => {
    if (!email) {
      showError("Veuillez saisir votre email pour réinitialiser le mot de passe.");
      return;
    }
    
    const success = await resetPassword(email);
    
    if (success) {
      showSuccess(`Un email de réinitialisation a été envoyé à ${email}`);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Connexion</h2>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Mot de passe</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required 
          />
        </div>
        
        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        
        <button 
          type="button" 
          onClick={handlePasswordReset}
          className="forgot-password-button"
          disabled={loading}
        >
          Mot de passe oublié ?
        </button>
      </form>
    </div>
  );
};

export default Login;