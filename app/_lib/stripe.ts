import { loadStripe, Stripe } from "@stripe/stripe-js";
import { API_BASE_URL } from "@/_config/constants";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Initialize Stripe with publishable key
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn("Stripe publishable key not found");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

/**
 * Create a payment intent on the backend
 */
export async function createPaymentIntent(
  amount: number,
  listingType: string,
  listingId?: string
): Promise<{ clientSecret: string; paymentId: string }> {
  const response = await fetch(`${API_BASE_URL}/payments/stripe/create-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Convert to cents
      listingType,
      listingId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create payment intent" }));
    throw new Error(error.message || "Failed to create payment intent");
  }

  return response.json();
}

/**
 * Confirm payment intent
 */
export async function confirmPayment(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{ success: boolean; listingId?: string; paymentId: string }> {
  const response = await fetch(`${API_BASE_URL}/payments/stripe/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      paymentIntentId,
      paymentMethodId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Payment confirmation failed" }));
    throw new Error(error.message || "Payment confirmation failed");
  }

  return response.json();
}

