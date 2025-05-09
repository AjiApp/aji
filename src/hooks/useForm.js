// src/hooks/useForm.js - Hook de gestion de formulaire personnalisé
import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour la gestion des formulaires avec validation
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Function} onSubmit - Fonction de soumission
 * @param {Object} validationRules - Règles de validation par champ
 * @param {Object} options - Options de configuration
 * @returns {Object} - Méthodes et état du formulaire
 */
export const useForm = (initialValues = {}, onSubmit, validationRules = {}, options = {}) => {
  // État des valeurs du formulaire
  const [values, setValues] = useState(initialValues);
  
  // État des erreurs de validation
  const [errors, setErrors] = useState({});
  
  // État de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État de validation du formulaire
  const [isValid, setIsValid] = useState(false);
  
  // Suivi des champs touchés
  const [touched, setTouched] = useState({});
  
  // Référence aux valeurs initiales pour le reset
  const initialValuesRef = useRef(initialValues);
  
  // Configuration par défaut
  const config = {
    validateOnChange: options.validateOnChange !== false,
    validateOnBlur: options.validateOnBlur !== false,
    validateOnSubmit: options.validateOnSubmit !== false,
    revalidateOnChange: options.revalidateOnChange !== false,
    ...options
  };

  /**
   * Valider un champ spécifique
   * @param {string} name - Nom du champ
   * @param {any} value - Valeur du champ
   * @returns {string|null} - Message d'erreur ou null si valide
   */
  const validateField = useCallback((name, value) => {
    // Si pas de règle pour ce champ, considérer valide
    if (!validationRules[name]) return null;

    const rule = validationRules[name];
    
    // Si la règle est une fonction, l'appeler
    if (typeof rule === 'function') {
      return rule(value, values) || null;
    }
    
    // Si la règle est un objet avec une fonction de validation
    if (rule.validate && typeof rule.validate === 'function') {
      try {
        const isValid = rule.validate(value, values);
        return isValid ? null : (rule.message || `${name} est invalide`);
      } catch (error) {
        console.error(`Erreur lors de la validation de ${name}:`, error);
        return `Erreur de validation pour ${name}`;
      }
    }
    
    // Si la règle est une expression régulière
    if (rule instanceof RegExp) {
      return rule.test(String(value)) ? null : `${name} est invalide`;
    }
    
    // Si la règle est un objet avec un pattern
    if (rule.pattern) {
      const pattern = rule.pattern instanceof RegExp ? 
        rule.pattern : new RegExp(rule.pattern);
      
      return pattern.test(String(value)) ? 
        null : (rule.message || `${name} est invalide`);
    }
    
    // Si la règle est un objet avec required=true
    if (rule.required) {
      if (value === undefined || value === null || value === '') {
        return rule.message || `${name} est requis`;
      }
    }
    
    // Si la règle est un objet avec min/max pour les nombres
    if ((rule.min !== undefined || rule.max !== undefined) && 
        (typeof value === 'number' || !isNaN(Number(value)))) {
      const numValue = Number(value);
      
      if (rule.min !== undefined && numValue < rule.min) {
        return rule.message || `${name} doit être supérieur ou égal à ${rule.min}`;
      }
      
      if (rule.max !== undefined && numValue > rule.max) {
        return rule.message || `${name} doit être inférieur ou égal à ${rule.max}`;
      }
    }
    
    // Si la règle est un objet avec minLength/maxLength pour les chaînes
    if ((rule.minLength !== undefined || rule.maxLength !== undefined) && 
        (typeof value === 'string')) {
      
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return rule.message || `${name} doit contenir au moins ${rule.minLength} caractères`;
      }
      
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return rule.message || `${name} doit contenir au maximum ${rule.maxLength} caractères`;
      }
    }
    
    return null;
  }, [validationRules, values]);

  /**
   * Valider tous les champs du formulaire
   * @returns {Object} - Erreurs de validation
   */
  const validateForm = useCallback(() => {
    const formErrors = {};
    let hasErrors = false;
    
    // Valider chaque champ
    Object.keys(values).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        formErrors[name] = error;
        hasErrors = true;
      }
    });
    
    // Vérifier les erreurs globales si une fonction est fournie
    if (validationRules._form && typeof validationRules._form === 'function') {
      const formLevelError = validationRules._form(values);
      if (formLevelError) {
        formErrors._form = formLevelError;
        hasErrors = true;
      }
    }
    
    setErrors(formErrors);
    setIsValid(!hasErrors);
    
    return { isValid: !hasErrors, errors: formErrors };
  }, [values, validateField, validationRules]);

  /**
   * Gérer le changement de valeur d'un champ
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Déterminer la valeur selon le type d'input
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Mettre à jour les valeurs
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Marquer le champ comme touché
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Valider le champ si nécessaire
    if (config.validateOnChange && validationRules[name]) {
      const error = validateField(name, fieldValue);
      
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      
      // Revalider le formulaire si nécessaire (pour les dépendances entre champs)
      if (config.revalidateOnChange) {
        setTimeout(() => validateForm(), 0);
      }
    }
  }, [validateField, validationRules, config.validateOnChange, config.revalidateOnChange, validateForm]);

  /**
   * Gérer le flou d'un champ (perte de focus)
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    // Marquer le champ comme touché
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Valider le champ si nécessaire
    if (config.validateOnBlur && validationRules[name]) {
      const error = validateField(name, values[name]);
      
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField, values, validationRules, config.validateOnBlur]);

  /**
   * Gérer la soumission du formulaire
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    
    // Valider le formulaire si nécessaire
    let formIsValid = isValid;
    
    if (config.validateOnSubmit) {
      const validation = validateForm();
      formIsValid = validation.isValid;
    }
    
    if (!formIsValid) {
      // Ne pas soumettre si le formulaire est invalide
      return;
    }
    
    // Soumettre le formulaire
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      
      // Ajouter une erreur globale
      setErrors(prev => ({
        ...prev,
        _form: error.message || 'Une erreur est survenue lors de la soumission'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, isValid, validateForm, config.validateOnSubmit, onSubmit]);

  /**
   * Définir manuellement la valeur d'un champ
   */
  const setValue = useCallback((name, value, shouldValidate = config.validateOnChange) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marquer le champ comme touché
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Valider le champ si nécessaire
    if (shouldValidate && validationRules[name]) {
      const error = validateField(name, value);
      
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
      
      // Revalider le formulaire si nécessaire
      if (config.revalidateOnChange) {
        setTimeout(() => validateForm(), 0);
      }
    }
  }, [validateField, validationRules, config.validateOnChange, config.revalidateOnChange, validateForm]);

  /**
   * Réinitialiser le formulaire
   */
  const resetForm = useCallback((newValues = initialValuesRef.current) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsValid(false);
    setIsSubmitting(false);
  }, []);

  /**
   * Valider le formulaire à l'initialisation
   */
  useEffect(() => {
    // Valider le formulaire initialement si demandé
    if (options.validateOnMount) {
      validateForm();
    }
  }, [options.validateOnMount, validateForm]);

  // Exposer les méthodes et l'état du formulaire
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    resetForm,
    validateForm,
    validateField
  };
};

export default useForm;