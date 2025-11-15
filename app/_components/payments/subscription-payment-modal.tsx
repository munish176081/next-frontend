"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Button } from "@/_components/ui/button";
import { getStripe, PayPalScriptProvider } from "@/_lib/stripe";
import { getPayPalOptions } from "@/_lib/paypal";
import {
  getSubscriptionPrice,
  formatPrice,
  isSubscriptionType,
} from "@/_lib/pricing";
import { ListingTypeEnum } from "@/_types/listing";
import { CreditCard, Mail, X, Loader2 } from "lucide-react";
import {
  createStripeSubscription,
  createPayPalSubscription,
  CreateStripeSubscriptionRequest,
  CreatePayPalSubscriptionRequest,
} from "@/_lib/api/subscriptions";

// Helper function to get listing type display name
function getListingTypeDisplayName(listingType: ListingTypeEnum): string {
  switch (listingType) {
    case ListingTypeEnum.SEMEN_LISTING:
      return "Semen Listing";
    case ListingTypeEnum.STUD_LISTING:
      return "Stud Listing";
    case ListingTypeEnum.FUTURE_LISTING:
      return "Future Listing";
    case ListingTypeEnum.OTHER_SERVICES:
      return "Other Services Listing";
    default:
      return "Listing";
  }
}

interface SubscriptionPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingType: ListingTypeEnum;
  listingTitle: string;
  listingBreed: string;
  listingLocation: string;
  listingImage?: string;
  listingId?: string;
  onSubscriptionSuccess: (subscriptionData: { subscriptionId: string; paymentMethod: string }) => void;
  onSubscriptionError?: (error: string) => void;
}

// Stripe Subscription Form Component
function StripeSubscriptionForm({
  clientSecret,
  onSuccess,
  onError,
  onProcessingChange,
}: {
  clientSecret?: string;
  onSuccess: (subscriptionId: string) => void;
  onError: (error: string) => void;
  onProcessingChange?: (processing: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    onProcessingChange?.(isProcessing);
  }, [isProcessing, onProcessingChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || "Subscription setup failed");
        setIsProcessing(false);
        return;
      }

      // For subscriptions, we need to confirm the setup intent or payment intent
      if (clientSecret) {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: window.location.origin,
          },
          redirect: "if_required",
        });

        if (error) {
          onError(error.message || "Subscription setup failed");
          setIsProcessing(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          // Extract subscription ID from metadata
          const subscriptionId = paymentIntent.metadata?.subscriptionId;
          if (subscriptionId) {
            onSuccess(subscriptionId);
          } else {
            onError("Subscription ID not found");
          }
        }
      }
    } catch (error: any) {
      onError(error.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form id="stripe-subscription-form" onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#635cff] hover:bg-[#5548e6] text-white font-medium py-3 rounded-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Subscribe Now"
        )}
      </Button>
    </form>
  );
}

export default function SubscriptionPaymentModal({
  open,
  onOpenChange,
  listingType,
  listingTitle,
  listingBreed,
  listingLocation,
  listingImage,
  listingId,
  onSubscriptionSuccess,
  onSubscriptionError,
}: SubscriptionPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthlyPrice = getSubscriptionPrice(listingType);
  const priceBreakdown = {
    basePrice: monthlyPrice,
    addons: [],
    total: monthlyPrice,
    duration: 30, // Monthly subscription
  };

  const handleClose = () => {
    if (!isProcessing) {
      setError(null);
      setStripeClientSecret(null);
      onOpenChange(false);
    }
  };

  const handlePaymentMethodSelect = (method: "stripe" | "paypal") => {
    if (!isProcessing) {
      setPaymentMethod(method);
      setError(null);
    }
  };

  const handleStripeSubscriptionSuccess = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const request: CreateStripeSubscriptionRequest = {
        listingType,
        listingId,
        paymentMethodId,
        includesFeatured: false,
      };

      const response = await createStripeSubscription(request);

      if (response.clientSecret) {
        // Store client secret for payment confirmation
        setStripeClientSecret(response.clientSecret);
      } else {
        // Subscription created successfully
        onSubscriptionSuccess({
          subscriptionId: response.subscriptionId,
          paymentMethod: "stripe",
        });
        handleClose();
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create subscription";
      setError(errorMessage);
      onSubscriptionError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalSubscriptionSuccess = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const request: CreatePayPalSubscriptionRequest = {
        listingType,
        listingId,
        includesFeatured: false,
      };

      const response = await createPayPalSubscription(request);

      // Redirect to PayPal approval URL
      if (response.approvalUrl) {
        window.location.href = response.approvalUrl;
      } else {
        onSubscriptionSuccess({
          subscriptionId: response.subscriptionId,
          paymentMethod: "paypal",
        });
        handleClose();
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create subscription";
      setError(errorMessage);
      onSubscriptionError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const stripePromise = getStripe();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] w-full max-h-[95vh] overflow-y-auto p-0 bg-white rounded-xl shadow-xl border-0">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 sm:px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
              Subscribe to {getListingTypeDisplayName(listingType)}
            </DialogTitle>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors -mr-1"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-4">
          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subscription Summary</h3>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                  {listingImage ? (
                    <Image
                      src={listingImage}
                      alt={listingTitle || "Listing"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Mail className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    {listingTitle || "New Listing"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {listingBreed} • {listingLocation}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Monthly Subscription</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(priceBreakdown.total)}/mo
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Recurring monthly payment. Cancel anytime.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">Payment Method</div>
            <div className="flex gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect("stripe")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all relative ${
                  paymentMethod === "stripe"
                    ? "bg-[#635cff] text-white border-[#635cff] shadow-sm"
                    : "bg-white text-[#635cff] border-[#635cff] hover:bg-[#635cff] hover:text-white"
                } font-medium text-sm sm:text-base flex items-center justify-center gap-2`}
              >
                <img src="/icons/stripe.svg" alt="Stripe" className="h-6 w-auto" />
                <span className="hidden sm:inline">Pay with Card</span>
              </button>
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect("paypal")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all relative ${
                  paymentMethod === "paypal"
                    ? "bg-[#0777bc] text-white border-[#0777bc] shadow-sm"
                    : "bg-white text-[#0777bc] border-[#0777bc] hover:bg-[#0777bc] hover:text-white"
                } font-medium text-sm sm:text-base flex items-center justify-center`}
              >
                <img 
                  src="/icons/paypal-w.png" 
                  alt="PayPal" 
                  className={`h-8 w-auto mr-2 ${paymentMethod === "paypal" ? "" : "hidden"}`} 
                />
                <img 
                  src="/icons/paypal-logo.png" 
                  alt="PayPal" 
                  className={`h-6 w-auto mr-2 ${paymentMethod === "paypal" ? "hidden" : ""}`} 
                />
                <span className="hidden sm:inline">PayPal</span>
              </button>
            </div>
          </div>

          {/* Payment Forms */}
          {paymentMethod === "stripe" && stripePromise && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: stripeClientSecret || undefined,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <StripeSubscriptionForm
                clientSecret={stripeClientSecret || undefined}
                onSuccess={(subscriptionId) => {
                  onSubscriptionSuccess({
                    subscriptionId,
                    paymentMethod: "stripe",
                  });
                  handleClose();
                }}
                onError={(error) => {
                  setError(error);
                  onSubscriptionError?.(error);
                }}
                onProcessingChange={setIsProcessing}
              />
            </Elements>
          )}

          {paymentMethod === "paypal" && (
            <PayPalScriptProvider options={getPayPalOptions()}>
              <PayPalButtons
                createSubscription={handlePayPalSubscriptionSuccess}
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "subscribe",
                }}
              />
            </PayPalScriptProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

