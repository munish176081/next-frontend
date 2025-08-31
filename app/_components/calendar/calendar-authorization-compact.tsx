"use client";

import React from 'react';
import { useCalendar } from '@/_contexts/calendar-context';

/**
 * Compact calendar authorization component for inline use
 * Shows minimal authorization status and connect button
 */
export function CalendarAuthorizationCompact() {
  const { isAuthorized, authorize, isLoading } = useCalendar();

  const handleConnect = async () => {
    await authorize();
  };

  if (isAuthorized) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">
            Google Calendar Connected
          </span>
        </div>
        <span className="text-xs text-green-600">
          Meeting will include calendar invite
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div>
        <div className="text-sm font-medium text-blue-900">
          Connect Google Calendar (Optional)
        </div>
        <div className="text-xs text-blue-600 mt-1">
          Automatically send calendar invites with Google Meet links
        </div>
      </div>
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
}

// Export as both named and default export for flexibility
export default CalendarAuthorizationCompact;
