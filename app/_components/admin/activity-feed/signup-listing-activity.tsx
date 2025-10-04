"use client";

import { useRecentSignups, useRecentListings, RecentActivity } from "@/_services/hooks/admin/use-recent-activities";
import { DashboardCard } from "@/_components/common/dashboard-widgets";
import { Users, Plus, Clock, RefreshCw, UserPlus, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface SignupListingActivityProps {
  className?: string;
  limit?: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'auth':
      return <UserPlus className="w-4 h-4 text-blue-500" />;
    case 'listing':
      return <FileText className="w-4 h-4 text-green-500" />;
    default:
      return <Users className="w-4 h-4 text-gray-500" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'auth':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'listing':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">
                {activity.type === 'auth' ? 'New Signup' : 'New Listing'}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                activity.type === 'auth' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
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
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {activity.actorEmail && <p>by <span className="font-medium text-gray-700">{activity.actorEmail}</span></p>}
            {activity.metadata?.username && <p>Username: <span className="font-medium text-gray-700">{activity.metadata.username}</span></p>}
            {activity.metadata?.role && <p>Role: <span className="font-medium text-gray-700">{activity.metadata.role}</span></p>}
          </div>
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

export const SignupListingActivity = ({ className = "", limit = 5 }: SignupListingActivityProps) => {
  const { data: signups, isLoading: signupsLoading, refetch: refetchSignups } = useRecentSignups(limit);
  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = useRecentListings(limit);

  const isLoading = signupsLoading || listingsLoading;
  const hasError = !signups || !listings;

  const allActivities: RecentActivity[] = [
    ...(signups?.logs || []),
    ...(listings?.logs || [])
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);

  const handleRefresh = () => {
    refetchSignups();
    refetchListings();
  };

  if (isLoading) {
    return (
      <DashboardCard title="Recent Signups & Listings" icon={Users} className={className}>
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

  if (hasError) {
    return (
      <DashboardCard title="Recent Signups & Listings" icon={Users} className={className}>
        <div className="p-4 text-center">
          <p className="text-sm text-red-600 mb-2">Failed to load activities</p>
          <button
            onClick={handleRefresh}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Recent Signups & Listings" icon={Users} className={className}>
      <div className="p-4 space-y-3">
        {allActivities.length > 0 ? (
          allActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No recent signups or listings</p>
          </div>
        )}
      </div>
      {allActivities.length > 0 && (
        <div className="px-4 pb-3 border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {signups?.logs?.length || 0} signups
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {listings?.logs?.length || 0} listings
              </span>
            </div>
            <span className="text-gray-400">
              Updated {formatDistanceToNow(new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
      )}
    </DashboardCard>
  );
};
