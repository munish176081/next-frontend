import { API_BASE_URL } from "@/_config/constants";

export interface Payment {
  id: string;
  userId: string;
  listingId: string | null;
  paymentMethod: 'stripe' | 'paypal';
  status: string;
  amount: number;
  currency: string;
  paymentIntentId: string | null;
  paymentMethodId: string | null;
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
  listingType: string | null;
  isFeatured: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all payments for the current user
 * @param syncFromStripe - If true, syncs payments from Stripe and merges with database records
 */
export async function getUserPayments(syncFromStripe: boolean = false): Promise<Payment[]> {
  const url = syncFromStripe 
    ? `${API_BASE_URL}/payments?sync=true`
    : `${API_BASE_URL}/payments`;
    
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  // Handle 304 Not Modified - return empty array or re-fetch
  if (response.status === 304) {
    console.warn('Payments endpoint returned 304 Not Modified, forcing refresh');
    // Force a fresh request by adding a timestamp
    const freshResponse = await fetch(`${API_BASE_URL}/payments?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      credentials: 'include',
      cache: 'no-store',
    });
    
    if (!freshResponse.ok) {
      const error = await freshResponse.json().catch(() => ({ message: 'Failed to fetch payments' }));
      throw new Error(error.message || 'Failed to fetch payments');
    }
    
    return freshResponse.json();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch payments' }));
    throw new Error(error.message || 'Failed to fetch payments');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<Payment> {
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch payment');
  }

  return response.json();
}

