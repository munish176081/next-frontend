import { API_BASE_URL } from "@/_config/constants";

export interface Subscription {
  id: string;
  userId: string;
  listingId: string | null;
  subscriptionId: string;
  paymentMethod: 'stripe' | 'paypal';
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  amount: number;
  currency: string;
  listingType: string | null;
  includesFeatured: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStripeSubscriptionRequest {
  listingType: string;
  listingId?: string;
  paymentMethodId?: string; // Optional - Payment Element will collect it if not provided
  includesFeatured?: boolean;
}

export interface CreatePayPalSubscriptionRequest {
  listingType: string;
  listingId?: string;
  includesFeatured?: boolean;
}

export interface CreateStripeSubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
}

export interface CreatePayPalSubscriptionResponse {
  subscriptionId: string;
  approvalUrl: string;
}

export interface CancelSubscriptionRequest {
  cancelAtPeriodEnd?: boolean;
}

/**
 * Create a Stripe subscription
 */
export async function createStripeSubscription(
  data: CreateStripeSubscriptionRequest
): Promise<CreateStripeSubscriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/stripe/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create Stripe subscription');
  }

  return response.json();
}

/**
 * Create a PayPal subscription
 */
export async function createPayPalSubscription(
  data: CreatePayPalSubscriptionRequest
): Promise<CreatePayPalSubscriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/paypal/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create PayPal subscription');
  }

  return response.json();
}

/**
 * Get all subscriptions for the current user
 * @param syncFromStripe - If true, fetches subscriptions directly from Stripe and syncs with database
 */
export async function getUserSubscriptions(syncFromStripe: boolean = false): Promise<Subscription[]> {
  const url = syncFromStripe 
    ? `${API_BASE_URL}/subscriptions?sync=true`
    : `${API_BASE_URL}/subscriptions`;
    
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch subscriptions');
  }

  return response.json();
}

/**
 * Get a subscription by ID
 */
export async function getSubscriptionById(subscriptionId: string): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch subscription');
  }

  return response.json();
}

/**
 * Confirm subscription payment and sync status from Stripe
 * Call this after payment is confirmed on the frontend
 */
export async function confirmSubscriptionPayment(subscriptionId: string): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/confirm-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to confirm subscription payment');
  }

  return response.json();
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ cancelAtPeriodEnd }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel subscription');
  }

  return response.json();
}

/**
 * Update subscription (add/remove featured add-on)
 */
export async function updateSubscription(
  subscriptionId: string,
  includesFeatured: boolean
): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ includesFeatured }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update subscription');
  }

  return response.json();
}

/**
 * Update payment method for a subscription
 */
export async function updatePaymentMethod(
  subscriptionId: string,
  paymentMethodId: string
): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/payment-method`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ paymentMethodId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update payment method');
  }

  return response.json();
}

/**
 * Get payment method for a subscription
 */
export async function getPaymentMethod(subscriptionId: string): Promise<{
  paymentMethod: 'stripe' | 'paypal';
  paymentMethodId?: string;
  customerId?: string;
}> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/payment-method`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch payment method');
  }

  return response.json();
}

/**
 * Check if user has an active subscription for a specific listing type
 */
export async function checkActiveSubscription(listingType: string): Promise<{
  hasSubscription: boolean;
  subscription?: Subscription;
}> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/check/${listingType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to check subscription');
  }

  return response.json();
}

/**
 * Sync PayPal subscription status from PayPal API
 */
export async function syncPayPalSubscription(subscriptionId: string): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/sync-paypal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sync PayPal subscription');
  }

  return response.json();
}

