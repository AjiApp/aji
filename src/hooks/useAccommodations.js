// src/hooks/useAccommodations.js
import { 
    useQuery, 
    useMutation, 
    useQueryClient 
  } from '@tanstack/react-query';
  import { locationsApi } from '../api/firebaseApi';
  
  // Clés de requête
  const ACCOMMODATIONS_KEYS = {
    all: ['accommodations'],
    detail: (id) => [...ACCOMMODATIONS_KEYS.all, id],
  };
  
  // Hook pour récupérer tous les hébergements
  export const useAccommodations = () => {
    return useQuery({
      queryKey: ACCOMMODATIONS_KEYS.all,
      queryFn: async () => {
        const locations = await locationsApi.getAll();
        // Filtrer pour ne récupérer que les hébergements
        return locations.filter(item => item.category === 'accommodation');
      },
    });
  };
  
  // Hook pour récupérer un hébergement par ID
  export const useAccommodation = (id) => {
    return useQuery({
      queryKey: ACCOMMODATIONS_KEYS.detail(id),
      queryFn: () => locationsApi.getById(id),
      enabled: !!id, // Exécute la requête seulement si un ID est fourni
    });
  };
  
  // Hook pour ajouter un hébergement
  export const useAddAccommodation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (accommodationData) => {
        // S'assurer que la catégorie est définie
        const dataWithCategory = {
          ...accommodationData,
          locationData: {
            ...accommodationData.locationData,
            category: 'accommodation'
          }
        };
        return locationsApi.create(dataWithCategory);
      },
      onSuccess: (newAccommodation) => {
        // Mettre à jour le cache en ajoutant le nouvel hébergement
        queryClient.setQueryData(ACCOMMODATIONS_KEYS.all, (oldData = []) => {
          return [newAccommodation, ...oldData];
        });
        
        // Mettre à jour également le cache des locations
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      },
    });
  };
  
  // Hook pour mettre à jour un hébergement
  export const useUpdateAccommodation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (accommodationData) => {
        // S'assurer que la catégorie est définie
        const dataWithCategory = {
          ...accommodationData,
          locationData: {
            ...accommodationData.locationData,
            category: 'accommodation'
          }
        };
        return locationsApi.update(dataWithCategory);
      },
      onSuccess: (updatedAccommodation) => {
        // Mettre à jour le cache de l'hébergement spécifique
        queryClient.setQueryData(
          ACCOMMODATIONS_KEYS.detail(updatedAccommodation.id),
          updatedAccommodation
        );
        
        // Mettre à jour le cache de tous les hébergements
        queryClient.setQueryData(ACCOMMODATIONS_KEYS.all, (oldData = []) => {
          return oldData.map((accommodation) => 
            accommodation.id === updatedAccommodation.id ? updatedAccommodation : accommodation
          );
        });
        
        // Mettre à jour également le cache des locations
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      },
    });
  };
  
  // Hook pour supprimer un hébergement
  export const useDeleteAccommodation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: locationsApi.delete,
      onSuccess: (deletedId) => {
        // Supprimer du cache de tous les hébergements
        queryClient.setQueryData(ACCOMMODATIONS_KEYS.all, (oldData = []) => {
          return oldData.filter((accommodation) => accommodation.id !== deletedId);
        });
        
        // Invalider et supprimer le cache de l'hébergement spécifique
        queryClient.removeQueries(ACCOMMODATIONS_KEYS.detail(deletedId));
        
        // Mettre à jour également le cache des locations
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      },
    });
  };