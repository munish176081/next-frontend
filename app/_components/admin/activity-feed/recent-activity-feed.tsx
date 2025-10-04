"use client";

import { useRecentActivities, useRecentActivitiesStats, RecentActivity } from "@/_services/hooks/admin/use-recent-activities";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { Activity, Users, Plus, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface RecentActivityFeedProps {
  className?: string;
  limit?: number;
}

const getActivityIcon = (type: string, level: string) => {
  switch (type) {
    case 'auth':
      return <Users className="w-4 h-4 text-blue-500" />;
    case 'listing':
      return <Plus className="w-4 h-4 text-green-500" />;
    case 'admin':
      return <Activity className="w-4 h-4 text-purple-500" />;
    case 'system':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    default:
      return <Activity className="w-4 h-4 text-gray-500" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'critical':
      return 'text-red-600 bg-red-50';
    case 'error':
      return 'text-red-500 bg-red-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'info':
    default:
      return 'text-blue-600 bg-blue-50';
  }
};

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className={`p-2 rounded-full ${getLevelColor(activity.level)}`}>
            {getActivityIcon(activity.type, activity.level)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getLevelColor(activity.level)}`}>
                {activity.level}
              </span>
              <span className="text-xs text-gray-500 font-medium capitalize">
                {activity.type}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activity.description}
          </p>
          {activity.actorEmail && (
            <p className="text-xs text-gray-500 mt-1">
              by <span className="font-medium text-gray-700">{activity.actorEmail}</span>
            </p>
          )}
          {activity.metadata && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:underline mt-2"
            >
              {isExpanded ? 'Show Less' : 'Show Details'}
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto">
            {JSON.stringify(activity.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export const RecentActivityFeed = ({ className = "", limit = 10 }: RecentActivityFeedProps) => {
  const { data: activities, isLoading, error, refetch } = useRecentActivities(limit);
  const { data: stats } = useRecentActivitiesStats();

  if (isLoading) {
    return (
      <DashboardCard title="Recent Activity" icon={Activity} className={className}>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard title="Recent Activity" icon={Activity} className={className}>
        <div className="p-4 text-center">
          <p className="text-sm text-red-600 mb-2">Failed to load activities</p>
          <button
            onClick={() => refetch()}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title="Recent Activity" 
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
      <div className="p-4 space-y-3">
        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xl font-semibold text-gray-800">{stats.activitiesToday}</p>
              <p className="text-xs text-gray-500">Today</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xl font-semibold text-gray-800">{stats.activitiesThisWeek}</p>
              <p className="text-xs text-gray-500">This Week</p>
            </div>
          </div>
        )}
        
        {activities?.logs && activities.logs.length > 0 ? (
          activities.logs.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Activity className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No recent activities</p>
          </div>
        )}
      </div>
      
      {activities?.logs && activities.logs.length > 0 && (
        <div className="px-4 pb-3 border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{activities.logs.length} recent activities</span>
            <span className="text-gray-400">
              Updated {formatDistanceToNow(new Date(activities.lastUpdated), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};
