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
import { getStripe, createPaymentIntent, confirmPayment } from "@/_lib/stripe";
import { createPayPalOrder, capturePayPalPayment, getPayPalOptions, PayPalScriptProvider } from "@/_lib/paypal";
import {
  getPriceBreakdown,
  isFeaturedAddonEligible,
  formatPrice,
  getListingDuration,
} from "@/_lib/pricing";
import { ListingTypeEnum } from "@/_types/listing";
import { CreditCard, Mail, X } from "lucide-react";

// Helper function to get listing type display name
function getListingTypeDisplayName(listingType: ListingTypeEnum): string {
  switch (listingType) {
    case ListingTypeEnum.PUPPY_LITTER_LISTING:
      return "Puppy Litter Listing";
    case ListingTypeEnum.PUPPY_LISTING:
      return "Puppy Listing";
    case ListingTypeEnum.SEMEN_LISTING:
      return "Semen Listing";
    case ListingTypeEnum.STUD_LISTING:
      return "Stud Listing";
    case ListingTypeEnum.FUTURE_LISTING:
      return "Future Listing";
    case ListingTypeEnum.WANTED_LISTING:
      return "Wanted Listing";
    case ListingTypeEnum.OTHER_SERVICES:
      return "Other Services Listing";
    default:
      return "Listing";
  }
}

interface ListingPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingType: ListingTypeEnum;
  listingTitle: string;
  listingBreed: string;
  listingLocation: string;
  listingImage?: string;
  onPaymentSuccess: (paymentData: { isFeatured: boolean; paymentMethod: string; paymentId: string }) => void;
  onPaymentError?: (error: string) => void;
}

// Stripe Payment Form Component
function StripePaymentForm({
  clientSecret,
  onSuccess,
  onError,
  onProcessingChange,
}: {
  clientSecret: string;
  onSuccess: (paymentId: string) => void;
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
        onError(submitError.message || "Payment submission failed");
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Get payment method ID from the payment intent
        const paymentMethodId = typeof paymentIntent.payment_method === 'string' 
          ? paymentIntent.payment_method 
          : paymentIntent.payment_method?.id;

        if (paymentMethodId) {
          // Confirm payment on backend to get paymentId
          try {
            const result = await confirmPayment(paymentIntent.id, paymentMethodId);
            if (result.success && result.paymentId) {
              onSuccess(result.paymentId);
            } else {
              onError("Payment confirmation failed");
            }
          } catch (confirmError: any) {
            onError(confirmError.message || "Failed to confirm payment");
          }
        } else {
          onError("Payment method not found");
        }
      }
    } catch (err: any) {
      onError(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="stripe-payment-form" className="w-full">
      <div className="w-full mb-4">
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>
    </form>
  );
}

// PayPal Payment Component
function PayPalPaymentButton({
  amount,
  listingType,
  onSuccess,
  onError,
}: {
  amount: number;
  listingType: ListingTypeEnum;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}) {
  const [{ isPending }] = usePayPalScriptReducer();

  const createOrder = async () => {
    try {
      const { orderId } = await createPayPalOrder(amount, listingType);
      return orderId;
    } catch (error: any) {
      onError(error.message || "Failed to create PayPal order");
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      const result = await capturePayPalPayment(data.orderID);
      if (result.success && result.paymentId) {
        onSuccess(result.paymentId);
      } else {
        onError("Payment capture failed");
      }
    } catch (error: any) {
      onError(error.message || "Payment capture failed");
    }
  };

  if (isPending) {
    return <div className="text-center py-4">Loading PayPal...</div>;
  }

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err: any) => onError(err?.message || err?.toString() || "PayPal error occurred")}
      style={{
        layout: "horizontal",
        color: "blue",
        shape: "rect",
        label: "paypal",
      }}
    />
  );
}

export function ListingPaymentModal({
  open,
  onOpenChange,
  listingType,
  listingTitle,
  listingBreed,
  listingLocation,
  listingImage,
  onPaymentSuccess,
  onPaymentError,
}: ListingPaymentModalProps) {
  const [includeFeatured, setIncludeFeatured] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const priceBreakdown = getPriceBreakdown(listingType, includeFeatured);
  const duration = getListingDuration(listingType);
  const canAddFeatured = isFeaturedAddonEligible(listingType);
  const listingTypeName = getListingTypeDisplayName(listingType);

  // Initialize Stripe payment intent when Stripe is selected
  useEffect(() => {
    if (open && paymentMethod === "stripe" && !stripeClientSecret && !isLoading) {
      initializeStripePayment();
    }
  }, [open, paymentMethod]);

  const initializeStripePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { clientSecret, paymentId } = await createPaymentIntent(
        priceBreakdown.total,
        listingType
      );
      setStripeClientSecret(clientSecret);
      setPaymentId(paymentId);
    } catch (err: any) {
      setError(err.message || "Failed to initialize payment");
      onPaymentError?.(err.message || "Failed to initialize payment");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method: "stripe" | "paypal") => {
    setPaymentMethod(method);
    setError(null);
    if (method === "stripe") {
      initializeStripePayment();
    }
  };

  const handleStripeSuccess = (confirmedPaymentId: string) => {
    onPaymentSuccess({
      isFeatured: includeFeatured,
      paymentMethod: "stripe",
      paymentId: confirmedPaymentId,
    });
    handleClose();
  };

  const handlePayPalSuccess = (capturedPaymentId: string) => {
    onPaymentSuccess({
      isFeatured: includeFeatured,
      paymentMethod: "paypal",
      paymentId: capturedPaymentId,
    });
    handleClose();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    onPaymentError?.(errorMessage);
  };

  const handleClose = () => {
    setPaymentMethod(null);
    setStripeClientSecret(null);
    setPaymentId(null);
    setIncludeFeatured(false);
    setError(null);
    onOpenChange(false);
  };

  const stripePromise = getStripe();

  useEffect(() => {
    console.log('Payment modal open state:', open);
  }, [open]);

  const handlePayAndPublish = async () => {
    if (paymentMethod === "stripe") {
      const form = document.getElementById("stripe-payment-form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] w-full max-h-[95vh] overflow-y-auto p-0 bg-white rounded-xl shadow-xl border-0">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 sm:px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
              Complete Your Listing
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
          {/* Order Summary Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Summary</h3>
            
            {/* Listing Details Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex gap-3">
                {/* Image Container */}
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
                {/* Listing Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-gray-900 mb-1">
                    {listingTitle || "Adorable puppies"}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {listingBreed || "Breed"}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {listingLocation || "Location"}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">{listingTypeName}</div>
                      <div className="text-xs text-gray-600">{duration} days</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatPrice(priceBreakdown.total)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PayPal Button */}
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect("paypal")}
                className={`relative rounded-lg border-2 transition-all ${
                  paymentMethod === "paypal"
                    ? "bg-[#0777bc] text-white border-[#0777bc] shadow-md"
                    : "bg-white text-[#0777bc] border-gray-300 hover:border-[#0777bc]"
                } font-medium text-sm py-3 px-4 flex items-center justify-center gap-2`}
              >
                {paymentMethod === "paypal" ? (
                  <img 
                    src="/icons/paypal-w.png" 
                    alt="PayPal" 
                    className="h-6 w-auto" 
                  />
                ) : (
                  <img 
                    src="/icons/paypal-logo.png" 
                    alt="PayPal" 
                    className="h-5 w-auto" 
                  />
                )}
                <span className="text-sm font-medium">PayPal</span>
                {paymentMethod === "paypal" && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#0777bc] rounded-full" />
                  </div>
                )}
              </button>
              
              {/* Stripe/Card Button */}
              <button
                type="button"
                onClick={() => handlePaymentMethodSelect("stripe")}
                className={`relative rounded-lg border-2 transition-all ${
                  paymentMethod === "stripe"
                    ? "bg-[#635cff] text-white border-[#635cff] shadow-md"
                    : "bg-white text-[#635cff] border-gray-300 hover:border-[#635cff]"
                } font-medium text-sm py-3 px-4 flex items-center justify-center gap-2`}
              >
                <img src="/icons/stripe.svg" alt="Stripe" className="h-5 w-auto" />
                <span className="text-sm font-medium">Credit Card</span>
                {paymentMethod === "stripe" && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#635cff] rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-0.5">Payment Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State for Stripe */}
          {paymentMethod === "stripe" && isLoading && !stripeClientSecret && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">Initializing payment...</p>
              </div>
            </div>
          )}

          {/* Payment Forms */}
          {paymentMethod === "stripe" && stripeClientSecret && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-0.5">Card Details</h4>
                <p className="text-xs text-gray-500">Secured by Stripe</p>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                <StripePaymentForm
                  clientSecret={stripeClientSecret}
                  onSuccess={handleStripeSuccess}
                  onError={handleError}
                  onProcessingChange={setIsProcessingPayment}
                />
              </Elements>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-0.5">PayPal Payment</h4>
                <p className="text-xs text-gray-500">Redirect to PayPal to complete</p>
              </div>
              <PayPalScriptProvider options={getPayPalOptions()}>
                <PayPalPaymentButton
                  amount={priceBreakdown.total}
                  listingType={listingType}
                  onSuccess={handlePayPalSuccess}
                  onError={handleError}
                />
              </PayPalScriptProvider>
            </div>
          )}

          {/* Pay & Publish Button - Only show for Stripe/Card payments */}
          {paymentMethod === "stripe" && stripeClientSecret && (
            <button
              type="button"
              onClick={handlePayAndPublish}
              disabled={isProcessingPayment || isLoading || !stripeClientSecret}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingPayment ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                "Pay & Publish"
              )}
            </button>
          )}

          {/* Cancel Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-900 underline transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

