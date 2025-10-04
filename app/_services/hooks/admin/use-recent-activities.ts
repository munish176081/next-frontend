import { axios } from "@/_lib/axios";
import { useQuery } from "@tanstack/react-query";

// Types for recent activities
export interface RecentActivity {
  id: string;
  type: 'auth' | 'listing' | 'admin' | 'system' | 'user' | 'meeting';
  level: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  resourceType?: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  targetId?: string;
  targetEmail?: string;
  targetType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecentActivitiesResponse {
  logs: RecentActivity[];
  total: number;
  lastUpdated: string;
}

export interface RecentActivitiesStats {
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

// Get recent activities (last 24 hours)
async function getRecentActivities(limit: number = 10): Promise<RecentActivitiesResponse> {
  const { data } = await axios.get(`/admin/activity-logs/recent?limit=${limit}`);
  return data;
}

// Get activity statistics
async function getActivityStats(): Promise<RecentActivitiesStats> {
  const { data } = await axios.get('/admin/activity-logs/stats');
  return data;
}

// Get recent signups only
async function getRecentSignups(limit: number = 10): Promise<RecentActivitiesResponse> {
  const { data } = await axios.get(`/admin/activity-logs/type/auth?limit=${limit}`);
  return data;
}

// Get recent listings only
async function getRecentListings(limit: number = 10): Promise<RecentActivitiesResponse> {
  const { data } = await axios.get(`/admin/activity-logs/type/listing?limit=${limit}`);
  return data;
}

// Hooks
export const useRecentActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: ["recent-activities", limit],
    queryFn: () => getRecentActivities(limit),
    staleTime: 10 * 1000, // 10 seconds for real-time feel
    gcTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useRecentActivitiesStats = () => {
  return useQuery({
    queryKey: ["recent-activities-stats"],
    queryFn: getActivityStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useRecentSignups = (limit: number = 10) => {
  return useQuery({
    queryKey: ["recent-signups", limit],
    queryFn: () => getRecentSignups(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useRecentListings = (limit: number = 10) => {
  return useQuery({
    queryKey: ["recent-listings", limit],
    queryFn: () => getRecentListings(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};
