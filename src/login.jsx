import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useNavigate } from 'react-router-dom';
import './login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // If already logged in, redirect to home
        navigate('/');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Connexion avec email et mot de passe
      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirection vers le dashboard - navigate is called automatically by the 
      // onAuthStateChanged hook above when auth state changes
    } catch (error) {
      // Handle login errors with user-friendly messages
      let errorMessage = "Une erreur s'est produite lors de la connexion.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-email' || 
          error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Email ou mot de passe incorrect.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Trop de tentatives échouées. Veuillez réessayer plus tard.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Problème de connexion réseau. Vérifiez votre connexion internet.";
      }
      
      setError(errorMessage);
      console.error("Erreur de connexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Veuillez saisir votre email pour réinitialiser le mot de passe.");
      return;
    }
    
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      alert('Un email de réinitialisation a été envoyé à ' + email);
    } catch (error) {
      let errorMessage = "Erreur lors de l'envoi de l'email de réinitialisation.";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Adresse email invalide.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "Aucun compte associé à cet email.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Connexion</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Mot de passe</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required 
          />
        </div>
        
        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
        
        <button 
          type="button" 
          onClick={handlePasswordReset}
          className="forgot-password-button"
          disabled={isLoading}
        >
          Mot de passe oublié ?
        </button>
      </form>
    </div>
  );
};

export default Login;