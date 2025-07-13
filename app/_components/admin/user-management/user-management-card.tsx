"use client";

import { useAdminDashboard } from "@/_services/hooks/admin/use-admin-dashboard";
import { DashboardCard, StatusBadge } from "@/_components/common/dashboard-widgets";
import { Users, UserCheck, UserX, UserCog, Crown, Shield, User } from "lucide-react";

export const UserManagementCard = () => {
  const { data: dashboardData, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <DashboardCard title="User Management" icon={Users} className="min-w-[298px] max-md:min-w-full max-md:max-w-full w-full">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-500">Loading user data...</span>
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="User Management" icon={Users} className="min-w-[298px] max-md:min-w-full max-md:max-w-full w-full">
        <div className="flex items-center justify-center h-32 text-red-500">
          <span className="text-sm">Failed to load user data</span>
        </div>
      </DashboardCard>
    );
  }

  const stats = dashboardData?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    unverifiedUsers: 0,
    superAdmins: 0,
    admins: 0,
    regularUsers: 0,
  };

  return (
    <DashboardCard title="User Management" icon={Users} className="min-w-[298px] max-md:min-w-full max-md:max-w-full w-full">
      <div className="flex flex-col gap-2 mt-2 mx-4">
        {/* Total Users */}
        <div className="h-8 border border-black/20 rounded-full flex items-center justify-between font-medium text-[10px] p-1.5">
          <div className="flex items-center space-x-2">
            <Users className="w-3 h-3" />
            <span>Total Users</span>
          </div>
          <span className="size-5 bg-[#F0D9FF] flex items-center justify-center rounded-full">
            {stats.totalUsers.toLocaleString()}
          </span>
        </div>

        {/* Active Users */}
        <div className="h-8 border border-black/20 rounded-full flex items-center justify-between font-medium text-[10px] p-1.5">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-3 h-3 text-green-600" />
            <span>Active Users</span>
          </div>
          <span className="text-green-600">{stats.activeUsers.toLocaleString()}</span>
        </div>

        {/* Suspended Users */}
        <div className="h-8 border border-black/20 rounded-full flex items-center justify-between font-medium text-[10px] p-1.5">
          <div className="flex items-center space-x-2">
            <UserX className="w-3 h-3 text-red-600" />
            <span>Suspended Users</span>
          </div>
          <span className="text-red-600">{stats.suspendedUsers.toLocaleString()}</span>
        </div>

        {/* Unverified Users */}
        <div className="h-8 border border-black/20 rounded-full flex items-center justify-between font-medium text-[10px] p-1.5">
          <div className="flex items-center space-x-2">
            <UserCog className="w-3 h-3 text-yellow-600" />
            <span>Unverified Users</span>
          </div>
          <span className="text-yellow-600">{stats.unverifiedUsers.toLocaleString()}</span>
        </div>

        {/* User Roles Breakdown */}
        <div className="mt-4 space-y-2">
          <div className="h-6 border border-black/20 rounded-full flex items-center justify-between font-medium text-[9px] p-1">
            <div className="flex items-center space-x-1">
              <Crown className="w-2 h-2 text-purple-600" />
              <span>Super Admins</span>
            </div>
            <span className="text-purple-600">{stats.superAdmins}</span>
          </div>

          <div className="h-6 border border-black/20 rounded-full flex items-center justify-between font-medium text-[9px] p-1">
            <div className="flex items-center space-x-1">
              <Shield className="w-2 h-2 text-blue-600" />
              <span>Admins</span>
            </div>
            <span className="text-blue-600">{stats.admins}</span>
          </div>

          <div className="h-6 border border-black/20 rounded-full flex items-center justify-between font-medium text-[9px] p-1">
            <div className="flex items-center space-x-1">
              <User className="w-2 h-2 text-gray-600" />
              <span>Regular Users</span>
            </div>
            <span className="text-gray-600">{stats.regularUsers}</span>
          </div>
        </div>

        {/* Status Badge */}
        <StatusBadge 
          status={stats.activeUsers > stats.suspendedUsers ? "Active" : "Warning"} 
          className="ml-auto mt-2" 
        />
      </div>
    </DashboardCard>
  );
}; 