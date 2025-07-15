"use client";

import { useState } from "react";
import { useActivityLogs, ActivityLogFilterParams } from "@/_services/hooks/admin/use-admin-activity-logs";
import { ActivityLogItem } from "./activity-log-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/select";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2
} from "lucide-react";
import { useCleanOldLogs } from "@/_services/hooks/admin/use-admin-activity-logs";

export const ActivityLogsView = () => {
  const [filters, setFilters] = useState<ActivityLogFilterParams>({
    page: 1,
    limit: 20,
  });
  const [showDetails, setShowDetails] = useState(false);

  const { data, isLoading, error, refetch } = useActivityLogs(filters);
  const cleanOldLogsMutation = useCleanOldLogs();

  const handleFilterChange = (key: keyof ActivityLogFilterParams, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleCleanOldLogs = async () => {
    if (confirm("Are you sure you want to clean old logs? This action cannot be undone.")) {
      try {
        await cleanOldLogsMutation.mutateAsync();
        alert("Old logs cleaned successfully!");
      } catch (error) {
        alert("Failed to clean old logs");
      }
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-red-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Failed to load activity logs</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search actions, descriptions, emails..."
                value={filters.search || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("search", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Activity Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Activity Type</label>
              <Select
                value={filters.type || ""}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="USER_CREATED">User Created</SelectItem>
                  <SelectItem value="USER_UPDATED">User Updated</SelectItem>
                  <SelectItem value="USER_DELETED">User Deleted</SelectItem>
                  <SelectItem value="USER_STATUS_CHANGED">User Status Changed</SelectItem>
                  <SelectItem value="USER_ROLE_CHANGED">User Role Changed</SelectItem>
                  <SelectItem value="ADMIN_ACTION">Admin Action</SelectItem>
                  <SelectItem value="SYSTEM_EVENT">System Event</SelectItem>
                  <SelectItem value="PASSWORD_CHANGED">Password Changed</SelectItem>
                  <SelectItem value="PASSWORD_RESET">Password Reset</SelectItem>
                  <SelectItem value="ACCOUNT_SUSPENDED">Account Suspended</SelectItem>
                  <SelectItem value="ACCOUNT_ACTIVATED">Account Activated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select
                value={filters.level || ""}
                onValueChange={(value) => handleFilterChange("level", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

                         {/* Date Range */}
             <div>
               <label className="text-sm font-medium mb-2 block">Start Date</label>
               <Input
                 type="date"
                 value={filters.startDate || ""}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("startDate", e.target.value)}
                 className="w-full"
               />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
             {/* End Date */}
             <div>
               <label className="text-sm font-medium mb-2 block">End Date</label>
               <Input
                 type="date"
                 value={filters.endDate || ""}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("endDate", e.target.value)}
                 className="w-full"
               />
             </div>

             {/* Actor ID */}
             <div>
               <label className="text-sm font-medium mb-2 block">Actor ID</label>
               <Input
                 placeholder="Actor user ID"
                 value={filters.actorId || ""}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("actorId", e.target.value)}
                 className="w-full"
               />
             </div>

             {/* Target ID */}
             <div>
               <label className="text-sm font-medium mb-2 block">Target ID</label>
               <Input
                 placeholder="Target user ID"
                 value={filters.targetId || ""}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange("targetId", e.target.value)}
                 className="w-full"
               />
             </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleCleanOldLogs}
              disabled={cleanOldLogsMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clean Old Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Activity Logs</span>
              {data && (
                <Badge variant="secondary">
                  {data.total} total • Page {data.page} of {data.totalPages}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading activity logs...</span>
            </div>
          ) : data?.logs && data.logs.length > 0 ? (
            <div className="space-y-4">
              {data.logs.map((log) => (
                <ActivityLogItem 
                  key={log.id} 
                  log={log} 
                  showDetails={showDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No activity logs found</p>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {((data.page - 1) * data.limit) + 1} to {Math.min(data.page * data.limit, data.total)} of {data.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(data.totalPages - 4, data.page - 2)) + i;
                    return (
                      <Button
                        key={page}
                        variant={page === data.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page >= data.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 