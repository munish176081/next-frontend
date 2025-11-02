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
      <div className="flex flex-col gap-3 mt-4 px-2 pb-2">
        {/* Total Users */}
        <div className="h-10 border border-gray-200 rounded-lg flex items-center justify-between font-medium text-sm px-4 bg-gradient-to-r from-purple-50 to-transparent">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-gray-700">Total Users</span>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 font-semibold rounded-full text-sm">
            {stats.totalUsers.toLocaleString()}
          </span>
        </div>

        {/* Active Users */}
        <div className="h-10 border border-gray-200 rounded-lg flex items-center justify-between font-medium text-sm px-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Active Users</span>
          </div>
          <span className="text-green-600 font-semibold">{stats.activeUsers.toLocaleString()}</span>
        </div>

        {/* Suspended Users */}
        <div className="h-10 border border-gray-200 rounded-lg flex items-center justify-between font-medium text-sm px-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-2.5">
            <UserX className="w-4 h-4 text-red-600" />
            <span className="text-gray-700">Suspended Users</span>
          </div>
          <span className="text-red-600 font-semibold">{stats.suspendedUsers.toLocaleString()}</span>
        </div>

        {/* Unverified Users */}
        <div className="h-10 border border-gray-200 rounded-lg flex items-center justify-between font-medium text-sm px-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-2.5">
            <UserCog className="w-4 h-4 text-amber-600" />
            <span className="text-gray-700">Unverified Users</span>
          </div>
          <span className="text-amber-600 font-semibold">{stats.unverifiedUsers.toLocaleString()}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-1"></div>

        {/* User Roles Breakdown */}
        <div className="space-y-2.5">
          <div className="h-9 border border-gray-200 rounded-lg flex items-center justify-between font-medium text-xs px-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-2">
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-gray-700">Super Admins</span>
            </div>
            <span className="text-purple-600 font-semibold">{stats.superAdmins}</span>
          </div>

          <div className="h-9 border border-gray-200 rounded-lg flex items-center justify-between font-medium text-xs px-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-gray-700">Admins</span>
            </div>
            <span className="text-blue-600 font-semibold">{stats.admins}</span>
          </div>

          <div className="h-9 border border-gray-200 rounded-lg flex items-center justify-between font-medium text-xs px-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-gray-700">Regular Users</span>
            </div>
            <span className="text-gray-600 font-semibold">{stats.regularUsers.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}; 