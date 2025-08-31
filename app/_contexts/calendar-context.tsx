'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCalendarOAuth } from '../_hooks/use-calendar-oauth';

interface CalendarContextType {
  // OAuth state
  isAuthorized: boolean;
  isLoading: boolean;
  tokens: { access_token: string; refresh_token?: string; expiry_date?: number } | null;
  error: string | null;
  
  // OAuth actions
  authorize: () => Promise<void>;
  handleCallback: (code: string) => Promise<boolean>;
  refreshTokens: () => Promise<boolean>;
  revokeAccess: () => void;
  
  // Utilities
  isTokenExpired: () => boolean;
  getValidToken: () => Promise<string | null>;
  
  // Calendar event creation
  createMeetingWithCalendar: (meetingData: any) => Promise<any>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface CalendarProviderProps {
  children: ReactNode;
}

export function CalendarProvider({ children }: CalendarProviderProps) {
  const calendarOAuth = useCalendarOAuth();

  // Create meeting with calendar integration
  const createMeetingWithCalendar = async (meetingData: any) => {
    const validToken = await calendarOAuth.getValidToken();
    
    if (!validToken) {
      throw new Error('Calendar not authorized. Please connect your calendar first.');
    }

    // Add both access token and refresh token to the meeting data
    const meetingWithToken = {
      ...meetingData,
      access_token: validToken,
      refresh_token: calendarOAuth.tokens?.refresh_token,
    };

    // Call your existing meeting creation API
    const response = await fetch('/api/v1/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(meetingWithToken),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create meeting');
    }

    return response.json();
  };

  const contextValue: CalendarContextType = {
    ...calendarOAuth,
    createMeetingWithCalendar,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextType {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
}

// Higher-order component for components that require calendar access
export function withCalendar<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function CalendarComponent(props: P) {
    return (
      <CalendarProvider>
        <Component {...props} />
      </CalendarProvider>
    );
  };
}
