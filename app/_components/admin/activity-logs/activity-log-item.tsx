"use client";

import { ActivityLog } from "@/_services/hooks/admin/use-admin-activity-logs";
import { Badge } from "@/_components/ui/badge";
import { Card, CardContent } from "@/_components/ui/card";
import { 
  Clock, 
  User, 
  Target, 
  Globe, 
  Monitor, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityLogItemProps {
  log: ActivityLog;
  showDetails?: boolean;
}

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'critical':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'info':
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const getLevelBadge = (level: string) => {
  switch (level) {
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    case 'warning':
      return <Badge variant="secondary">Warning</Badge>;
    case 'info':
    default:
      return <Badge variant="default">Info</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  if (type?.includes('USER')) return <User className="w-4 h-4" />;
  if (type?.includes('ADMIN')) return <Monitor className="w-4 h-4" />;
  if (type?.includes('SYSTEM')) return <Globe className="w-4 h-4" />;
  if (type?.includes('LISTING')) return <Target className="w-4 h-4" />;
  if (type?.includes('MEETING')) return <Target className="w-4 h-4" />;
  return <Info className="w-4 h-4" />;
};

const formatAction = (action: string) => {
  return action?.charAt(0).toUpperCase() + action?.slice(1);
};

const formatType = (type: string) => {
  return type?.replace(/_/g, ' ').toLowerCase();
};

export const ActivityLogItem = ({ log, showDetails = false }: ActivityLogItemProps) => {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {/* Level Icon */}
            <div className="mt-1">
              {getLevelIcon(log.level)}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">{formatAction(log.action)}</span>
                {getLevelBadge(log.level)}
                <Badge variant="outline" className="text-xs">
                  {formatType(log.type)}
                </Badge>
              </div>

              {log.description && (
                <p className="text-sm text-gray-600 mb-2">{log.description}</p>
              )}

              {/* Actor and Target Info */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {log.actorEmail && (
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>By: {log.actorEmail}</span>
                    {log.actorRole && (
                      <Badge variant="outline" className="text-xs">
                        {log.actorRole}
                      </Badge>
                    )}
                  </div>
                )}

                {log.targetEmail && (
                  <div className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>Target: {log.targetEmail}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {(() => {
                      try {
                        if (log?.createdAt) {
                          const date = new Date(log.createdAt);
                          if (!isNaN(date.getTime())) {
                            return formatDistanceToNow(date, { addSuffix: true });
                          }
                        }
                        return 'N/A';
                      } catch (error) {
                        console.warn('Invalid date for activity log:', log?.id, log?.createdAt);
                        return 'N/A';
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Detailed Information */}
              {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {log.ipAddress && (
                      <div>
                        <span className="font-medium">IP Address:</span>
                        <span className="ml-1 text-gray-600">{log.ipAddress}</span>
                      </div>
                    )}
                    
                    {log.resourceType && (
                      <div>
                        <span className="font-medium">Resource:</span>
                        <span className="ml-1 text-gray-600">{log.resourceType}</span>
                      </div>
                    )}

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="col-span-2">
                        <span className="font-medium">Metadata:</span>
                        <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Type Icon */}
          <div className="ml-2 mt-1">
            {getTypeIcon(log.type)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 