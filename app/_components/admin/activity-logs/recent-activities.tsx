"use client";

import { useRecentActivities } from "@/_services/hooks/admin/use-admin-activity-logs";
import { ActivityLogItem } from "./activity-log-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Activity, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/_components/ui/button";

interface RecentActivitiesProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export const RecentActivities = ({ 
  limit = 10, 
  showTitle = true,
  className = "" 
}: RecentActivitiesProps) => {
  const { data, isLoading, error, refetch } = useRecentActivities(limit);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading recent activities...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load recent activities</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Activities</span>
              <Badge variant="secondary">{data?.total || 0}</Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="pt-0">
        {data?.logs && data.logs.length > 0 ? (
          <div className="space-y-3">
            {data.logs.map((log) => (
              <ActivityLogItem key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activities</p>
          </div>
        )}
        
        {data?.logs && data.logs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Last updated: {
                  (() => {
                    try {
                      if (data?.lastUpdated) {
                        const date = new Date(data.lastUpdated);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleTimeString();
                        }
                      }
                      return 'N/A';
                    } catch (error) {
                      console.warn('Invalid lastUpdated date:', data?.lastUpdated);
                      return 'N/A';
                    }
                  })()
                }
              </span>
              <span>Auto-refresh every 30s</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 