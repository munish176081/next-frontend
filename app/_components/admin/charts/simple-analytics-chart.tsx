"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { BarChart3, TrendingUp, Users } from "lucide-react";
import { WeeklyUserData } from "@/_services/hooks/admin/use-admin-dashboard";

interface SimpleAnalyticsChartProps {
  data: WeeklyUserData[];
  isLoading?: boolean;
  className?: string;
}

export const SimpleAnalyticsChart = ({ data, isLoading = false, className = "" }: SimpleAnalyticsChartProps) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Weekly User Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Loading chart...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Weekly User Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max values for scaling
  const maxNewUsers = Math.max(...data.map(item => item.newUsers));
  const maxActiveUsers = Math.max(...data.map(item => item.activeUsers));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Weekly User Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {/* Chart Container */}
          <div className="relative h-full">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
              <span>{maxNewUsers}</span>
              <span>{Math.round(maxNewUsers * 0.75)}</span>
              <span>{Math.round(maxNewUsers * 0.5)}</span>
              <span>{Math.round(maxNewUsers * 0.25)}</span>
              <span>0</span>
            </div>

            {/* Chart Area */}
            <div className="ml-12 h-full relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border-t border-gray-200"></div>
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-between px-2 pb-4">
                {data.map((item, index) => {
                  const newUsersHeight = (item.newUsers / maxNewUsers) * 100;
                  const activeUsersHeight = (item.activeUsers / maxActiveUsers) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-1 w-8">
                      {/* New Users Bar */}
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${newUsersHeight}%` }}
                        title={`New Users: ${item.newUsers}`}
                      ></div>
                      
                      {/* Active Users Bar */}
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${activeUsersHeight}%` }}
                        title={`Active Users: ${item.activeUsers}`}
                      ></div>
                      
                      {/* Date Label */}
                      <div className="text-xs text-gray-500 text-center transform rotate-45 origin-left">
                        {(() => {
                          try {
                            if (item.date) {
                              const date = new Date(item.date);
                              if (!isNaN(date.getTime())) {
                                return date.toLocaleDateString('en-US', { 
                                  month: 'short',
                                  day: 'numeric'
                                });
                              }
                            }
                            return 'N/A';
                          } catch (error) {
                            console.warn('Invalid date in analytics:', item.date);
                            return 'N/A';
                          }
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-0 right-0 flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>New Users</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Active Users</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 