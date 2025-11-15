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

