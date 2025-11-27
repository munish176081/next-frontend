"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { syncPayPalSubscription } from '@/_lib/api/subscriptions';

export default function PayPalSubscriptionCallback() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const subscriptionId = searchParams.get('subscription_id');
  const token = searchParams.get('token');

  useEffect(() => {
    // Prevent multiple redirects
    if (sessionStorage.getItem('paypalCallbackProcessed') === 'true') {
      return;
    }
    sessionStorage.setItem('paypalCallbackProcessed', 'true');
    
    // Check if we're in a popup window
    const isPopup = window.opener && window.opener !== window;
    
    if (isPopup) {
      // We're in a popup - communicate with parent window
      if (success === 'true') {
        // Subscription approved - sync status from PayPal
        const pendingSubscriptionId = sessionStorage.getItem('pendingPayPalSubscriptionId');
        if (pendingSubscriptionId) {
          sessionStorage.setItem('paypalSubscriptionApproved', 'true');
          
          // Sync subscription status from PayPal
          syncPayPalSubscription(pendingSubscriptionId).catch((error) => {
            console.error('Failed to sync PayPal subscription status:', error);
          });
          
          // Try to send message to parent
          try {
            window.opener?.postMessage(
              { type: 'PAYPAL_SUBSCRIPTION_APPROVED', subscriptionId: pendingSubscriptionId },
              window.location.origin
            );
          } catch (e) {
            console.error('Failed to send message to parent:', e);
          }
        }
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      } else if (canceled === 'true') {
        // Subscription canceled
        sessionStorage.setItem('paypalSubscriptionApproved', 'false');
        try {
          window.opener?.postMessage(
            { type: 'PAYPAL_SUBSCRIPTION_CANCELED' },
            window.location.origin
          );
        } catch (e) {
          console.error('Failed to send message to parent:', e);
        }
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    } else {
      // Not in popup - redirect flow (PayPal opens in same window)
      if (success === 'true') {
        const pendingListingId = sessionStorage.getItem('pendingListingId');
        const dbSubscriptionId = sessionStorage.getItem('pendingPayPalSubscriptionId');
        
        // Sync subscription status
        if (dbSubscriptionId) {
          syncPayPalSubscription(dbSubscriptionId).catch((error) => {
            console.error('Failed to sync PayPal subscription status:', error);
          });
        }
        
        // Clear all session storage
        sessionStorage.removeItem('pendingPayPalSubscriptionId');
        sessionStorage.removeItem('pendingPayPalApprovalUrl');
        sessionStorage.removeItem('pendingListingId');
        sessionStorage.removeItem('paypalCallbackProcessed');
        
        // Redirect to listings page - the listing will be activated by webhook
        window.location.href = '/account/listings?payment=success';
      } else if (canceled === 'true') {
        // Clear any pending data
        sessionStorage.removeItem('pendingPayPalSubscriptionId');
        sessionStorage.removeItem('pendingPayPalApprovalUrl');
        sessionStorage.removeItem('pendingListingId');
        sessionStorage.removeItem('paypalCallbackProcessed');
        window.location.href = '/account/listings?payment=canceled';
      } else {
        sessionStorage.removeItem('paypalCallbackProcessed');
        window.location.href = '/account/listings';
      }
    }
  }, [success, canceled, subscriptionId, token]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {success === 'true' 
            ? 'Processing your subscription...' 
            : canceled === 'true'
            ? 'Subscription canceled.'
            : 'Processing...'}
        </p>
        {success === 'true' && (
          <p className="text-sm text-gray-500 mt-2">You can close this window.</p>
        )}
      </div>
    </div>
  );
}







