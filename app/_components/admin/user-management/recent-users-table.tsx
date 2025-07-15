"use client";

import { useRecentUsers } from "@/_services/hooks/admin/use-admin-dashboard";
import { DashboardCard, DashboardTable, StatusBadge } from "@/_components/common/dashboard-widgets";
import { Users, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const RecentUsersTable = () => {
  const { data: users, isLoading, error, refetch } = useRecentUsers(10);

  if (isLoading) {
    return (
      <DashboardCard title="Recent Users" className="w-full mt-auto">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading recent users...</span>
          </div>
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="Recent Users" className="w-full mt-auto">
        <div className="flex items-center justify-center py-8 text-red-500">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load recent users</span>
          </div>
        </div>
      </DashboardCard>
    );
  }

  // Transform users data for the table
  const userRows = users?.map(user => {
    // Safely handle date formatting
    let joinedText = 'N/A';
    if (user?.joined) {
      try {
        const joinedDate = new Date(user.joined);
        if (!isNaN(joinedDate.getTime())) {
          joinedText = formatDistanceToNow(joinedDate, { addSuffix: true });
        }
      } catch (error) {
        console.warn('Invalid date for user:', user.id, user.joined);
      }
    }

    return {
      name: user?.name || 'N/A',
      email: user?.email || 'N/A',
      role: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).replace('_', ' ') || 'N/A',
      joined: joinedText,
      status: user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1).replace('_', ' ') || 'N/A',
      action: "•••"
    };
  }) || [];

  return (
    <DashboardCard title="Recent Users" className="w-full mt-auto">
      <DashboardTable
        headers={["NAME", "EMAIL", "ROLE", "JOINED", "STATUS", "ACTION"]}
        data={userRows}
      />
    </DashboardCard>
  );
}; 