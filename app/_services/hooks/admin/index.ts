// Users
export { useAdminUsers } from "./use-admin-users";
export { useAdminUser, useUpdateUserStatus, useUpdateUserRole, useDeleteUser } from "./use-admin-user-actions";

// Password Management
export { 
  useSetUserPassword, 
  useCreateSuperAdmin, 
  useResetSuperAdminPassword, 
  useSeedSuperAdmin 
} from "./use-admin-password-management";

// Activity Logs
export {
  useActivityLogs,
  useRecentActivities,
  useActivityStats,
  useUserActivities,
  useActivitiesByType,
  useCleanOldLogs,
  type ActivityLog,
  type ActivityLogListType,
  type RecentActivityType,
  type ActivityStatsType,
  type ActivityLogFilterParams
} from "./use-admin-activity-logs";

// Breeds Management
export {
  useAdminBreeds,
  useAdminBreed,
  useAdminActiveBreeds,
  useAdminSearchBreeds,
  useCreateBreed,
  useUpdateBreed,
  useDeleteBreed,
  useHardDeleteBreed,
  useToggleBreedStatus,
  type Breed,
  type CreateBreedData,
  type UpdateBreedData,
  type BreedQueryParams,
  type BreedsResponse
} from "./use-admin-breeds";

// Breeds Import
export { useImportBreeds, type ImportResult } from "./use-import-breeds"; 