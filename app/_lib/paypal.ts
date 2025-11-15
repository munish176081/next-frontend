import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { API_BASE_URL } from "@/_config/constants";

/**
 * Get PayPal client ID from environment
 */
export function getPayPalClientId(): string {
  return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
}

/**
 * PayPal script provider options
 */
export function getPayPalOptions() {
  return {
    clientId: getPayPalClientId(),
    currency: "USD",
    intent: "capture" as const,
  };
}

/**
 * Create a PayPal order on the backend
 */
export async function createPayPalOrder(
  amount: number,
  listingType: string,
  listingId?: string
): Promise<{ orderId: string; paymentId: string }> {
  const response = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      amount,
      listingType,
      listingId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to create PayPal order" }));
    throw new Error(error.message || "Failed to create PayPal order");
  }

  return response.json();
}

/**
 * Capture PayPal payment
 */
export async function capturePayPalPayment(
  orderId: string
): Promise<{ success: boolean; listingId?: string; paymentId: string }> {
  const response = await fetch(`${API_BASE_URL}/payments/paypal/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      orderId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Payment capture failed" }));
    throw new Error(error.message || "Payment capture failed");
  }

  return response.json();
}

export { PayPalScriptProvider };

