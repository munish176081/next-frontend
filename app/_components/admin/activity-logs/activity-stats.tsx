"use client";

import { useActivityStats } from "@/_services/hooks/admin/use-admin-activity-logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  AlertTriangle,
  RefreshCw,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/_components/ui/button";

interface ActivityStatsProps {
  showTitle?: boolean;
  className?: string;
}

export const ActivityStats = ({ showTitle = true, className = "" }: ActivityStatsProps) => {
  const { data, isLoading, error, refetch } = useActivityStats();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading activity statistics...</span>
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
            <span className="text-sm">Failed to load activity statistics</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Activity Statistics</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Activities */}
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Activity className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">
              {data.totalActivities.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Activities</div>
          </div>

          {/* Today's Activities */}
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">
              {data.activitiesToday.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Today</div>
          </div>

          {/* This Week */}
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">
              {data.activitiesThisWeek.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">This Week</div>
          </div>

          {/* This Month */}
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">
              {data.activitiesThisMonth.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">This Month</div>
          </div>
        </div>

        {/* Top Activity Types */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Top Activity Types</span>
            </h4>
            <div className="space-y-2">
              {data.topActivityTypes.slice(0, 5).map((item, index) => (
                <div key={item.type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium">
                      {item.type.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Top Actors */}
          <div>
            <h4 className="font-medium text-sm mb-3 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Top Actors</span>
            </h4>
            <div className="space-y-2">
              {data.topActors.slice(0, 5).map((actor, index) => (
                <div key={actor.actorId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="text-sm font-medium truncate max-w-[150px]">
                      {actor.actorEmail}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {actor.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 