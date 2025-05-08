// src/hooks/useAuth.js - Vérifie si l'utilisateur est authentifié
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // Observer l'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError(null);
    }, (error) => {
      setError(error);
      setLoading(false);
    });
    
    // Nettoyer l'observer lors du démontage
    return () => unsubscribe();
  }, []);

  // Connexion avec email/mot de passe
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      setError(formatAuthError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // Vider le cache de React Query lors de la déconnexion
      queryClient.clear();
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Réinitialisation du mot de passe
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      setError(formatAuthError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    return !!user;
  };

  // Récupérer le token d'authentification
  const getAuthToken = async () => {
    if (!user) {
      throw new Error('User is not authenticated');
    }
    
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  };

  // Formater les messages d'erreur d'authentification
  const formatAuthError = (error) => {
    let errorMessage = "Une erreur s'est produite lors de l'opération.";
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = "Email ou mot de passe incorrect.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Trop de tentatives échouées. Veuillez réessayer plus tard.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Problème de connexion réseau. Vérifiez votre connexion internet.";
        break;
      case 'auth/email-already-in-use':
        errorMessage = "Cet email est déjà utilisé par un autre compte.";
        break;
      case 'auth/weak-password':
        errorMessage = "Le mot de passe est trop faible.";
        break;
      default:
        errorMessage = `Erreur: ${error.message}`;
    }
    
    return errorMessage;
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated,
    getAuthToken
  };
};