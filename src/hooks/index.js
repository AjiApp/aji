// src/hooks/index.js
// Exporter tous les hooks pour faciliter l'importation

// Auth hook
export { useAuth } from './useAuth';

// Locations hooks (Visit Morocco)
export {
  useLocations,
  useLocation,
  useAddLocation,
  useUpdateLocation,
  useDeleteLocation
} from './useLocations';

// Features hooks
export {
  useFeatures,
  useFeature,
  useAddFeature,
  useUpdateFeature,
  useDeleteFeature
} from './useFeatures';

// Accommodations hooks
export {
  useAccommodations,
  useAccommodation,
  useAddAccommodation,
  useUpdateAccommodation,
  useDeleteAccommodation
} from './useAccommodations';

// Stadiums hooks
export {
  useStadiums,
  useStadium,
  useAddStadium,
  useUpdateStadium,
  useDeleteStadium
} from './useStadiums';