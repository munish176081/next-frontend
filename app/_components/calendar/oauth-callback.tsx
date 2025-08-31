'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface OAuthCallbackProps {
  onSuccess?: (code: string) => void;
  onError?: (error: string) => void;
}

export function OAuthCallback({ onSuccess, onError }: OAuthCallbackProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const errorMsg = errorDescription || error || 'Authorization failed';
      setStatus('error');
      setMessage(errorMsg);
      
      // Send error to parent window (for popup flow)
      if (window.opener) {
        window.opener.postMessage({
          type: 'CALENDAR_AUTH_ERROR',
          error: errorMsg,
        }, window.location.origin);
      }
      
      onError?.(errorMsg);
      return;
    }

    if (code) {
      setStatus('success');
      setMessage('Authorization successful! Redirecting...');
      
      // Send success to parent window (for popup flow)
      if (window.opener) {
        window.opener.postMessage({
          type: 'CALENDAR_AUTH_SUCCESS',
          code: code,
        }, window.location.origin);
      }
      
      onSuccess?.(code);
      
      // Close popup after delay
      setTimeout(() => {
        if (window.opener) {
          window.close();
        }
      }, 2000);
      return;
    }

    // No code or error - something went wrong
    setStatus('error');
    setMessage('No authorization code received');
    
    if (window.opener) {
      window.opener.postMessage({
        type: 'CALENDAR_AUTH_ERROR',
        error: 'No authorization code received',
      }, window.location.origin);
    }
    
    onError?.('No authorization code received');
  }, [searchParams, onSuccess, onError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
            
            {status === 'success' && (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  Your Google Calendar has been connected successfully!
                </p>
                <p className="text-xs text-muted-foreground">
                  This window will close automatically...
                </p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-2">
                <p className="text-sm text-red-600">
                  Calendar authorization failed.
                </p>
                <p className="text-xs text-muted-foreground">
                  Please close this window and try again.
                </p>
              </div>
            )}
            
            {status === 'loading' && (
              <p className="text-xs text-muted-foreground">
                Please wait while we process your authorization...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Page component for the callback route
export default function CalendarCallbackPage() {
  const handleSuccess = (code: string) => {
    console.log('OAuth authorization successful:', code);
  };

  const handleError = (error: string) => {
    console.error('OAuth authorization failed:', error);
  };

  return (
    <OAuthCallback 
      onSuccess={handleSuccess} 
      onError={handleError} 
    />
  );
}
