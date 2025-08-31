import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface CalendarTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

interface CalendarOAuthState {
  isAuthorized: boolean;
  isLoading: boolean;
  tokens: CalendarTokens | null;
  error: string | null;
}

interface UseCalendarOAuthReturn {
  // State
  isAuthorized: boolean;
  isLoading: boolean;
  tokens: CalendarTokens | null;
  error: string | null;
  
  // Actions
  authorize: () => Promise<void>;
  handleCallback: (code: string) => Promise<boolean>;
  refreshTokens: () => Promise<boolean>;
  revokeAccess: () => void;
  
  // Utilities
  isTokenExpired: () => boolean;
  getValidToken: () => Promise<string | null>;
}

const STORAGE_KEY = 'pups4sale_calendar_tokens';
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useCalendarOAuth(): UseCalendarOAuthReturn {
  const { toast } = useToast();
  
  const [state, setState] = useState<CalendarOAuthState>({
    isAuthorized: false,
    isLoading: false,
    tokens: null,
    error: null,
  });

  // Load tokens from localStorage on mount
  useEffect(() => {
    const savedTokens = localStorage.getItem(STORAGE_KEY);
    if (savedTokens) {
      try {
        const tokens: CalendarTokens = JSON.parse(savedTokens);
        setState(prev => ({
          ...prev,
          tokens,
          isAuthorized: true,
        }));
      } catch (error) {
        console.error('Failed to parse saved calendar tokens:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save tokens to localStorage whenever they change
  const saveTokens = useCallback((tokens: CalendarTokens | null) => {
    if (tokens) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    setState(prev => ({
      ...prev,
      tokens,
      isAuthorized: !!tokens,
      error: null,
    }));
  }, []);

  // Check if current token is expired
  const isTokenExpired = useCallback((): boolean => {
    if (!state.tokens?.expiry_date) return false;
    return Date.now() >= state.tokens.expiry_date;
  }, [state.tokens]);

  // Get authorization URL and redirect user
  const authorize = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/calendar/auth-url`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get authorization URL');
      }
      
      const { authUrl } = await response.json();
      
      // Open authorization in popup window
      const popup = window.open(
        authUrl,
        'calendar-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for the authorization callback
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'CALENDAR_AUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          const success = await handleCallback(event.data.code);
          if (success) {
            // Load tokens from backend after successful authorization
            await loadTokensFromBackend();
          }
        } else if (event.data.type === 'CALENDAR_AUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: event.data.error || 'Authorization failed' 
          }));
          toast({
            title: 'Authorization Failed',
            description: event.data.error || 'Failed to authorize calendar access',
            variant: 'destructive',
          });
        }
      };

      window.addEventListener('message', handleMessage);

      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }, 1000);

    } catch (error) {
      console.error('Authorization error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Authorization failed' 
      }));
      toast({
        title: 'Authorization Failed',
        description: error instanceof Error ? error.message : 'Failed to start authorization',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Load tokens from backend (after successful OAuth)
  const loadTokensFromBackend = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/calendar/tokens`, {
        credentials: 'include',
      });

      if (response.ok) {
        const { tokens } = await response.json();
        if (tokens) {
          saveTokens(tokens);
        }
      }
    } catch (error) {
      console.error('Error loading tokens from backend:', error);
    }
  }, []);

  // Handle OAuth callback with authorization code
  const handleCallback = useCallback(async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/calendar/oauth-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to exchange authorization code');
      }

      const { tokens } = await response.json();
      
      saveTokens(tokens);
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Calendar Connected!',
        description: 'Your Google Calendar is now connected. Meeting invites will be sent automatically.',
        variant: 'default',
      });
      
      return true;
    } catch (error) {
      console.error('Callback error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to complete authorization' 
      }));
      toast({
        title: 'Authorization Failed',
        description: error instanceof Error ? error.message : 'Failed to complete authorization',
        variant: 'destructive',
      });
      return false;
    }
  }, [saveTokens, toast]);

  // Refresh expired access token
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (!state.tokens?.refresh_token) {
      return false;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/calendar/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refresh_token: state.tokens.refresh_token }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const { tokens: newTokens } = await response.json();
      
      // Merge with existing tokens (refresh token might not be returned)
      const updatedTokens = {
        ...state.tokens,
        ...newTokens,
      };
      
      saveTokens(updatedTokens);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear tokens and require re-authorization
      saveTokens(null);
      setState(prev => ({ 
        ...prev, 
        error: 'Session expired. Please re-authorize calendar access.' 
      }));
      return false;
    }
  }, [state.tokens, saveTokens]);

  // Get a valid access token (refresh if needed)
  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!state.tokens) return null;

    // If token is not expired, return it
    if (!isTokenExpired()) {
      return state.tokens.access_token;
    }

    // Try to refresh the token
    const refreshed = await refreshTokens();
    if (refreshed && state.tokens) {
      return state.tokens.access_token;
    }

    return null;
  }, [state.tokens, isTokenExpired, refreshTokens]);

  // Revoke calendar access
  const revokeAccess = useCallback(() => {
    saveTokens(null);
    setState(prev => ({
      ...prev,
      error: null,
    }));
    toast({
      title: 'Calendar Disconnected',
      description: 'Calendar access has been revoked. You can reconnect anytime.',
      variant: 'default',
    });
  }, [saveTokens, toast]);

  return {
    // State
    isAuthorized: state.isAuthorized,
    isLoading: state.isLoading,
    tokens: state.tokens,
    error: state.error,
    
    // Actions
    authorize,
    handleCallback,
    refreshTokens,
    revokeAccess,
    
    // Utilities
    isTokenExpired,
    getValidToken,
  };
}
