// src/hooks/useLocations.js
import { 
    useQuery, 
    useMutation, 
    useQueryClient 
  } from '@tanstack/react-query';
  import { locationsApi } from '../api/firebaseApi';
  
  // Clés de requête
  const LOCATIONS_KEYS = {
    all: ['locations'],
    detail: (id) => [...LOCATIONS_KEYS.all, id],
  };
  
  // Hook pour récupérer tous les lieux
  export const useLocations = () => {
    return useQuery({
      queryKey: LOCATIONS_KEYS.all,
      queryFn: locationsApi.getAll,
    });
  };
  
  // Hook pour récupérer un lieu par ID
  export const useLocation = (id) => {
    return useQuery({
      queryKey: LOCATIONS_KEYS.detail(id),
      queryFn: () => locationsApi.getById(id),
      enabled: !!id, // Exécute la requête seulement si un ID est fourni
    });
  };
  
  // Hook pour ajouter un lieu
  export const useAddLocation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: locationsApi.create,
      onSuccess: (newLocation) => {
        // Mettre à jour le cache en ajoutant le nouveau lieu
        queryClient.setQueryData(LOCATIONS_KEYS.all, (oldData = []) => {
          return [...oldData, newLocation];
        });
      },
    });
  };
  
  // Hook pour mettre à jour un lieu
  export const useUpdateLocation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: locationsApi.update,
      onSuccess: (updatedLocation) => {
        // Mettre à jour le cache du lieu spécifique
        queryClient.setQueryData(
          LOCATIONS_KEYS.detail(updatedLocation.id),
          updatedLocation
        );
        
        // Mettre à jour le cache de tous les lieux
        queryClient.setQueryData(LOCATIONS_KEYS.all, (oldData = []) => {
          return oldData.map((location) => 
            location.id === updatedLocation.id ? updatedLocation : location
          );
        });
      },
    });
  };
  
  // Hook pour supprimer un lieu
  export const useDeleteLocation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: locationsApi.delete,
      onSuccess: (deletedId) => {
        // Supprimer du cache de tous les lieux
        queryClient.setQueryData(LOCATIONS_KEYS.all, (oldData = []) => {
          return oldData.filter((location) => location.id !== deletedId);
        });
        
        // Invalider et supprimer le cache du lieu spécifique
        queryClient.removeQueries(LOCATIONS_KEYS.detail(deletedId));
      },
    });
  };