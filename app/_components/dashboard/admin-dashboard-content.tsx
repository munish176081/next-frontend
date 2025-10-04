"use client";

import { DashboardCard, DashboardTable, StatusBadge } from "@/_components/common/dashboard-widgets";
import { BarChart3, Users, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { RecentActivities } from "@/_components/admin/activity-logs/recent-activities";
import { ActivityStats } from "@/_components/admin/activity-logs/activity-stats";
import { UserManagementCard } from "@/_components/admin/user-management/user-management-card";
import { RecentUsersTable } from "@/_components/admin/user-management/recent-users-table";
import { SimpleAnalyticsChart } from "@/_components/admin/charts/simple-analytics-chart";
import { SignupListingActivity } from "@/_components/admin/activity-feed/signup-listing-activity";
import { useWeeklyUserAnalytics } from "@/_services/hooks/admin/use-admin-dashboard";

const alerts = [
  {
    type: "System Alert",
    message: "High server load detected - 5 minutes ago",
    priority: "high",
    icon: "!"
  },
  {
    type: "System Info",
    message: "Database backup completed - 1 hour ago",
    priority: "info",
    icon: "i"
  },
  {
    type: "User Activity",
    message: "New user registration spike - 2 hours ago",
    priority: "success",
    icon: "+"
  }
];

export const AdminDashboardContent = () => {
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyUserAnalytics();

  return (
    <div className="w-full space-y-6">
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SimpleAnalyticsChart 
            data={weeklyData || []} 
            isLoading={weeklyLoading}
            className="w-full h-full"
          />
        </div>
        <div className="space-y-6">
          <UserManagementCard />
          <DashboardCard title="System Alerts" icon={AlertTriangle}>
            <div className="p-4 space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 pt-1">
                    <span className={`size-3 rounded-full flex items-center justify-center text-xs text-white font-bold ${
                      alert.priority === 'high' ? 'bg-red-500' : 
                      alert.priority === 'info' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}>
                      {alert.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{alert.type}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Recent Users Table */}
      <div>
        <RecentUsersTable />
      </div>

      {/* Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <SignupListingActivity limit={5} className="w-full" />
        <RecentActivities limit={5} className="w-full" />
        <ActivityStats className="w-full" />
      </div>
    </div>
  );
}; 