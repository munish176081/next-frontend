import { axios } from "@/_lib/axios";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

// Types for activity logs
export interface ActivityLog {
  id: string;
  type: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  description: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  resourceId: string;
  resourceType: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  targetId: string;
  targetEmail: string;
  targetType: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogListType {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecentActivityType {
  logs: ActivityLog[];
  total: number;
  lastUpdated: string;
}

export interface ActivityStatsType {
  totalActivities: number;
  activitiesToday: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  topActivityTypes: Array<{
    type: string;
    count: number;
  }>;
  topActors: Array<{
    actorId: string;
    actorEmail: string;
    count: number;
  }>;
}

export interface ActivityLogFilterParams {
  page?: number;
  limit?: number;
  type?: string;
  level?: string;
  actorId?: string;
  targetId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Get all activity logs with filtering
async function getActivityLogs(params: ActivityLogFilterParams = {}): Promise<ActivityLogListType> {
  const {
    page = 1,
    limit = 20,
    type,
    level,
    actorId,
    targetId,
    resourceType,
    startDate,
    endDate,
    search,
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (type) searchParams.append('type', type);
  if (level) searchParams.append('level', level);
  if (actorId) searchParams.append('actorId', actorId);
  if (targetId) searchParams.append('targetId', targetId);
  if (resourceType) searchParams.append('resourceType', resourceType);
  if (startDate) searchParams.append('startDate', startDate);
  if (endDate) searchParams.append('endDate', endDate);
  if (search) searchParams.append('search', search);

  const { data } = await axios.get(`/admin/activity-logs?${searchParams.toString()}`);
  return data;
}

// Get recent activities (last 24 hours)
async function getRecentActivities(limit: number = 50): Promise<RecentActivityType> {
  const { data } = await axios.get(`/admin/activity-logs/recent?limit=${limit}`);
  return data;
}

// Get activity statistics
async function getActivityStats(): Promise<ActivityStatsType> {
  const { data } = await axios.get('/admin/activity-logs/stats');
  return data;
}

// Get user activities
async function getUserActivities(userId: string, params: { page?: number; limit?: number } = {}): Promise<ActivityLogListType> {
  const { page = 1, limit = 20 } = params;
  const { data } = await axios.get(`/admin/activity-logs/user/${userId}?page=${page}&limit=${limit}`);
  return data;
}

// Get activities by type
async function getActivitiesByType(type: string, params: { page?: number; limit?: number } = {}): Promise<ActivityLogListType> {
  const { page = 1, limit = 20 } = params;
  const { data } = await axios.get(`/admin/activity-logs/type/${type}?page=${page}&limit=${limit}`);
  return data;
}

// Clean old logs
async function cleanOldLogs(): Promise<{ message: string; deletedCount: number }> {
  const { data } = await axios.get('/admin/activity-logs/clean/old-logs');
  return data;
}

// Hooks
export const useActivityLogs = (params: ActivityLogFilterParams = {}) => {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: () => getActivityLogs(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useRecentActivities = (limit: number = 50) => {
  return useQuery({
    queryKey: ["recent-activities", limit],
    queryFn: () => getRecentActivities(limit),
    staleTime: 10 * 1000, // 10 seconds for real-time feel
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useActivityStats = () => {
  return useQuery({
    queryKey: ["activity-stats"],
    queryFn: getActivityStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserActivities = (userId: string, params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ["user-activities", userId, params],
    queryFn: () => getUserActivities(userId, params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivitiesByType = (type: string, params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ["activities-by-type", type, params],
    queryFn: () => getActivitiesByType(type, params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useCleanOldLogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cleanOldLogs,
    onSuccess: () => {
      // Invalidate all activity-related queries
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activities"] });
      queryClient.invalidateQueries({ queryKey: ["activity-stats"] });
    },
  });
}; 