// src/hooks/useStadiums.js
import { 
    useQuery, 
    useMutation, 
    useQueryClient 
  } from '@tanstack/react-query';
  import { locationsApi } from '../api/firebaseApi';
  
  // Clés de requête
  const STADIUMS_KEYS = {
    all: ['stadiums'],
    detail: (id) => [...STADIUMS_KEYS.all, id],
  };
  
  // Hook pour récupérer tous les stades
  export const useStadiums = () => {
    return useQuery({
      queryKey: STADIUMS_KEYS.all,
      queryFn: async () => {
        const locations = await locationsApi.getAll();
        // Filtrer pour ne récupérer que les stades
        return locations.filter(item => item.category === 'stadiums');
      },
    });
  };
  
  // Hook pour récupérer un stade par ID
  export const useStadium = (id) => {
    return useQuery({
      queryKey: STADIUMS_KEYS.detail(id),
      queryFn: () => locationsApi.getById(id),
      enabled: !!id, // Exécute la requête seulement si un ID est fourni
    });
  };
  
  // Hook pour ajouter un stade
  export const useAddStadium = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (stadiumData) => {
        // S'assurer que la catégorie est définie
        const dataWithCategory = {
          ...stadiumData,
          locationData: {
            ...stadiumData.locationData,
            category: 'stadiums'
          }
        };
        return locationsApi.create(dataWithCategory);
      },
      onSuccess: (newStadium) => {
        // Mettre à jour le cache en ajoutant le nouveau stade
        queryClient.setQueryData(STADIUMS_KEYS.all, (oldData = []) => {
          return [newStadium, ...oldData];
        });
        
        // Mettre à jour également le cache des locations
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      },
    });
  };
  
  // Hook pour mettre à jour un stade
  export const useUpdateStadium = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (stadiumData) => {
        // S'assurer que la catégorie est définie
        const dataWithCategory = {
          ...stadiumData,
          locationData: {
            ...stadiumData.locationData,
            category: 'stadiums'
          }
        };
        return locationsApi.update(dataWithCategory);
      },
      onSuccess: (updatedStadium) => {
        // Mettre à jour le cache du stade spécifique
        queryClient.setQueryData(
          STADIUMS_KEYS.detail(updatedStadium.id),
          updatedStadium
        );
        
        // Mettre à jour le cache de tous les stades
        queryClient.setQueryData(STADIUMS_KEYS.all, (oldData = []) => {
          return oldData.map((stadium) => 
            stadium.id === updatedStadium.id ? updatedStadium : stadium
          );
        });
        
        // Mettre à jour également le cache des locations
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      },
    });
  };
  
  // Hook pour supprimer un stade
  export const useDeleteStadium = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: locationsApi.delete,
      onSuccess: (deletedId) => {
        // Supprimer du cache de tous les stades
        queryClient.setQueryData(STADIUMS_KEYS.all, (oldData = []) => {
          return oldData.filter((stadium) => stadium.id !== deletedId);
        });
        
        // Invalider et supprimer le cache du stade spécifique
        queryClient.removeQueries(STADIUMS_KEYS.detail(deletedId));
        
        // Mettre à jour également le cache des locations
        queryClient.invalidateQueries({ queryKey: ['locations'] });
      },
    });
  };