import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase/config';
import { useNavigate } from 'react-router-dom';
import './login.css'; 
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Connexion avec email et mot de passe
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Redirection vers le dashboard
      navigate('/home');
    } catch (error) {
      // Gestion des erreurs de connexion
      setError(error.message);
      console.error("Erreur de connexion:", error);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Un email de réinitialisation a été envoyé');
    } catch (error) {
      setError(error.message);
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
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Mot de passe</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        
        <button type="submit" className="login-button">
          Se connecter
        </button>
        
        <button 
          type="button" 
          onClick={handlePasswordReset}
          className="forgot-password-button"
        >
          Mot de passe oublié ?
        </button>
      </form>
    </div>
  );
};

export default Login;