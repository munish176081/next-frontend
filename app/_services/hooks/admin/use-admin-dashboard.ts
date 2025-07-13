import { axios } from "@/_lib/axios";
import { useQuery } from "@tanstack/react-query";

// Types for dashboard data
export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  unverifiedUsers: number;
  superAdmins: number;
  admins: number;
  regularUsers: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'not_verified';
  joined: string;
  imageUrl?: string;
}

export interface WeeklyUserData {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentUsers: RecentUser[];
  weeklyUserData: WeeklyUserData[];
}

// Get admin dashboard data
async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const { data } = await axios.get('/admin/dashboard');
  
  // Transform the backend response to match our frontend interface
  return {
    stats: {
      totalUsers: data.totalUsers || 0,
      activeUsers: data.activeUsers || 0,
      suspendedUsers: data.suspendedUsers || 0,
      unverifiedUsers: data.unverifiedUsers || 0,
      superAdmins: data.superAdmins || 0,
      admins: data.admins || 0,
      regularUsers: data.regularUsers || 0,
    },
    recentUsers: [], // This will be fetched separately
    weeklyUserData: [], // This will be fetched separately
  };
}

// Get recent users
async function getRecentUsers(limit: number = 10): Promise<RecentUser[]> {
  const { data } = await axios.get(`/admin/users?limit=${limit}`);
  
  // Transform the backend user data to match our frontend interface
  return (data.users || []).map((user: any) => {
    // Debug: Log the date format we're getting from backend
    console.log('User date from backend:', user.id, user.createdAt, user.joinedAt);
    
    return {
      id: user.id,
      name: user.name || user.username || 'N/A',
      email: user.email,
      role: user.role,
      status: user.status,
      joined: user.createdAt || user.joinedAt || new Date().toISOString(), // Ensure we have a valid date
      imageUrl: user.profileImageUrl,
    };
  });
}

// Get weekly user analytics
async function getWeeklyUserAnalytics(): Promise<WeeklyUserData[]> {
  // For now, we'll generate mock weekly data
  // In the future, this should come from a real analytics endpoint
  const today = new Date();
  const weekData: WeeklyUserData[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    weekData.push({
      date: date.toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 20) + 5, // Mock data
      activeUsers: Math.floor(Math.random() * 100) + 50, // Mock data
    });
  }
  
  return weekData;
}

// Hook for admin dashboard data
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboardData,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for recent users
export const useRecentUsers = (limit: number = 10) => {
  return useQuery({
    queryKey: ["recent-users", limit],
    queryFn: () => getRecentUsers(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for weekly user analytics
export const useWeeklyUserAnalytics = () => {
  return useQuery({
    queryKey: ["weekly-user-analytics"],
    queryFn: getWeeklyUserAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 