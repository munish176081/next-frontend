"use client";

import { DashboardCard, DashboardTable, StatusBadge } from "@/_components/common/dashboard-widgets";
import { BarChart3, Users, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { RecentActivities } from "@/_components/admin/activity-logs/recent-activities";
import { ActivityStats } from "@/_components/admin/activity-logs/activity-stats";
import { UserManagementCard } from "@/_components/admin/user-management/user-management-card";
import { RecentUsersTable } from "@/_components/admin/user-management/recent-users-table";
import { SimpleAnalyticsChart } from "@/_components/admin/charts/simple-analytics-chart";
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
    <div className="flex flex-col w-full gap-4 max-md:flex-col">
      <div className="flex flex-col w-full gap-4 max-md:flex-col">
        <div className="flex gap-4 h-full max-md:flex-col max-md:w-full">
          {/* System Analytics Card */}
          <SimpleAnalyticsChart 
            data={weeklyData || []} 
            isLoading={weeklyLoading}
            className="min-w-[298px] max-md:min-w-full max-md:max-w-full w-full"
          />

          {/* User Management Card */}
          <UserManagementCard />

          {/* System Alerts Card */}
          <DashboardCard title="System Alerts" icon={AlertTriangle} className="max-w-[298px] max-md:min-w-full max-md:max-w-full w-full">
            <div className="flex mx-4 flex-col gap-2 max-md:pb-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex flex-col bg-[#F3F3F3] px-4 py-2.5 rounded-full gap-1">
                  <div className="flex gap-2 text-[10px] font-semibold items-center relative">
                    <span className={`size-1.5 rounded-full ${
                      alert.priority === 'high' ? 'bg-[#FFCE20]' : 
                      alert.priority === 'info' ? 'bg-[#74D27E]' : 'bg-[#74D27E]'
                    } absolute left-[18px] top-[18px] border border-white`}></span>
                    <span className="size-6 rounded-full overflow-hidden">
                      <img className="w-full h-full object-cover" src="/images/vectors/profile.jpg" alt="" />
                    </span>
                    {alert.type}
                    <span className={`size-3 rounded-full ${
                      alert.priority === 'high' ? 'bg-[#EE5D50]' : 
                      alert.priority === 'info' ? 'bg-[#74D27E]' : 'bg-[#74D27E]'
                    } flex items-center justify-center text-[8px] text-white`}>
                      {alert.icon}
                    </span>
                  </div>
                  <span className="text-[9px] whitespace-nowrap text-ellipsis block overflow-hidden text-[#888787]">
                    {alert.message}
                  </span>
                </div>
              ))}
              <button className="w-full h-16 bg-black text-white text-[22px] rounded-full max-md:h-12 max-md:text-base">
                View Alerts
              </button>
            </div>
          </DashboardCard>
        </div>

                  {/* Recent Users Table */}
          <RecentUsersTable />
      </div>

      {/* Right Sidebar */}
      <div className="flex flex-col w-72 min-w-72 gap-4 max-md:w-full max-md:min-w-full">
        {/* Recent Activities */}
        <RecentActivities limit={5} className="w-full" />

        {/* Activity Statistics */}
        <ActivityStats className="w-full mt-auto" />
      </div>
    </div>
  );
}; 