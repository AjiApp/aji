// src/hooks/useFeatures.js
import { 
    useQuery, 
    useMutation, 
    useQueryClient 
  } from '@tanstack/react-query';
  import { contentsApi } from '../api/firebaseApi';
  
  // Clés de requête
  const FEATURES_KEYS = {
    all: ['features'],
    detail: (id) => [...FEATURES_KEYS.all, id],
  };
  
  // Hook pour récupérer tous les contenus
  export const useFeatures = () => {
    return useQuery({
      queryKey: FEATURES_KEYS.all,
      queryFn: contentsApi.getAll,
    });
  };
  
  // Hook pour récupérer un contenu par ID
  export const useFeature = (id) => {
    return useQuery({
      queryKey: FEATURES_KEYS.detail(id),
      queryFn: () => contentsApi.getById(id),
      enabled: !!id, // Exécute la requête seulement si un ID est fourni
    });
  };
  
  // Hook pour ajouter un contenu
  export const useAddFeature = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: contentsApi.create,
      onSuccess: (newContent) => {
        // Mettre à jour le cache en ajoutant le nouveau contenu
        queryClient.setQueryData(FEATURES_KEYS.all, (oldData = []) => {
          return [newContent, ...oldData];
        });
      },
    });
  };
  
  // Hook pour mettre à jour un contenu
  export const useUpdateFeature = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: contentsApi.update,
      onSuccess: (updatedContent) => {
        // Mettre à jour le cache du contenu spécifique
        queryClient.setQueryData(
          FEATURES_KEYS.detail(updatedContent.id),
          updatedContent
        );
        
        // Mettre à jour le cache de tous les contenus
        queryClient.setQueryData(FEATURES_KEYS.all, (oldData = []) => {
          return oldData.map((content) => 
            content.id === updatedContent.id ? updatedContent : content
          );
        });
      },
    });
  };
  
  // Hook pour supprimer un contenu
  export const useDeleteFeature = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: contentsApi.delete,
      onSuccess: (deletedId) => {
        // Supprimer du cache de tous les contenus
        queryClient.setQueryData(FEATURES_KEYS.all, (oldData = []) => {
          return oldData.filter((content) => content.id !== deletedId);
        });
        
        // Invalider et supprimer le cache du contenu spécifique
        queryClient.removeQueries(FEATURES_KEYS.detail(deletedId));
      },
    });
  };