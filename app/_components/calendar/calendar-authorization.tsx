'use client';

import React from 'react';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCalendar } from '../../_contexts/calendar-context';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface CalendarAuthorizationProps {
  showTitle?: boolean;
  showDescription?: boolean;
  variant?: 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
}

export function CalendarAuthorization({ 
  showTitle = true, 
  showDescription = true,
  variant = 'card',
  size = 'md'
}: CalendarAuthorizationProps) {
  const { 
    isAuthorized, 
    isLoading, 
    error, 
    authorize, 
    revokeAccess 
  } = useCalendar();

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  const AuthorizationContent = () => (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : isAuthorized ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <Calendar className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1">
          <p className="font-medium text-sm">
            {isLoading ? 'Connecting...' : 
             isAuthorized ? 'Calendar Connected' : 
             'Calendar Not Connected'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Please complete authorization in the popup window' :
             isAuthorized ? 'Automatic meeting invites and Google Meet links enabled' :
             'Connect your calendar for automatic meeting invites'}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Features List */}
      {showDescription && !isAuthorized && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Calendar integration enables:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>✅ Automatic email invitations to meeting participants</li>
            <li>✅ Google Meet links generated automatically</li>
            <li>✅ Events appear in your personal Google Calendar</li>
            <li>✅ Email reminders for upcoming meetings</li>
            <li>✅ Professional meeting management</li>
          </ul>
        </div>
      )}

      {/* Authorization Button */}
      <div className="flex gap-2">
        {!isAuthorized ? (
          <Button 
            onClick={authorize} 
            disabled={isLoading}
            size={buttonSize}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Connect Google Calendar
              </>
            )}
          </Button>
        ) : (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={revokeAccess}
              size={buttonSize}
              className="flex-1 sm:flex-none"
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'inline') {
    return <AuthorizationContent />;
  }

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          {showDescription && (
            <CardDescription>
              Connect your Google Calendar to automatically send meeting invites 
              and create Google Meet links for puppy viewing appointments.
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        <AuthorizationContent />
      </CardContent>
    </Card>
  );
}

// Compact version for use in meeting forms
export function CalendarAuthorizationCompact() {
  const { isAuthorized, isLoading, authorize } = useCalendar();

  if (isAuthorized) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Calendar connected - automatic invites enabled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Connect Calendar for Auto-Invites
          </p>
          <p className="text-xs text-blue-700">
            Send automatic invites with Google Meet links
          </p>
        </div>
      </div>
      <Button 
        size="sm" 
        onClick={authorize} 
        disabled={isLoading}
        variant="outline"
        className="border-blue-300 text-blue-700 hover:bg-blue-100"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          'Connect'
        )}
      </Button>
    </div>
  );
}

// Status indicator for dashboards
export function CalendarStatus() {
  const { isAuthorized, isLoading, error } = useCalendar();

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      ) : isAuthorized ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : error ? (
        <AlertCircle className="h-4 w-4 text-red-500" />
      ) : (
        <Calendar className="h-4 w-4 text-gray-400" />
      )}
      
      <span className="text-sm">
        {isLoading ? 'Connecting...' :
         isAuthorized ? 'Connected' :
         error ? 'Error' :
         'Not Connected'}
      </span>
    </div>
  );
}
