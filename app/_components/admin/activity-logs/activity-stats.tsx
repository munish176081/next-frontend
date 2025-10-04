"use client";

import { useActivityStats } from "@/_services/hooks/admin/use-admin-activity-logs";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { Activity, Users, AlertTriangle, List, RefreshCw } from "lucide-react";

interface ActivityStatsProps {
  className?: string;
}

export const ActivityStats = ({ className = "" }: ActivityStatsProps) => {
  const { data: stats, isLoading, error, refetch } = useActivityStats();

  if (isLoading) {
    return (
      <DashboardCard title="Activity Statistics" icon={Activity} className={className}>
        <div className="p-4 space-y-3 animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="Activity Statistics" icon={Activity} className={className}>
        <div className="p-4 text-center">
          <p className="text-sm text-red-600">Failed to load stats</p>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title="Activity Statistics" 
      icon={Activity} 
      className={className}
      action={
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      }
    >
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats?.totalActivities || 0}</p>
            <p className="text-xs font-medium">Total</p>
          </div>
          <div className="bg-green-50 text-green-800 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats?.activitiesToday || 0}</p>
            <p className="text-xs font-medium">Today</p>
          </div>
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats?.activitiesThisWeek || 0}</p>
            <p className="text-xs font-medium">This Week</p>
          </div>
          <div className="bg-purple-50 text-purple-800 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{stats?.activitiesThisMonth || 0}</p>
            <p className="text-xs font-medium">This Month</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <List className="w-4 h-4 text-gray-500" />
              Top Activity Types
            </h4>
            <div className="space-y-1 text-sm">
              {stats?.topActivityTypes.map((type, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                  <span className="font-medium text-gray-700">#{index + 1} {type.type}</span>
                  <span className="font-bold text-gray-800">{type.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              Top Actors
            </h4>
            <div className="space-y-1 text-sm">
              {stats?.topActors.map((actor, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                  <span className="font-medium text-gray-700 truncate">#{index + 1} {actor.actorEmail}</span>
                  <span className="font-bold text-gray-800">{actor.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}; 