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
  ADDON_PRICES,
  isSubscriptionType,
} from "@/_lib/pricing";
import { createStripeSubscription, createPayPalSubscription, syncPayPalSubscription, confirmSubscriptionPayment } from "@/_lib/api/subscriptions";
import { ListingTypeEnum } from "@/_types/listing";
import { 
  hasStripePriceId, 
  getStripePriceId,
  hasPayPalPlanId,
  getPayPalPlanId,
  isSubscriptionTypeByPriceId,
  STRIPE_PRICE_IDS,
  PAYPAL_PLAN_IDS
} from "@/_config/subscription-prices";
import { CreditCard, Mail, X, Video } from "lucide-react";

// Helper function to check if a URL is a video file
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return !!lowerUrl.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|3gp|ogg|m4v)(\?|$)/);
}

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
  listingImages?: string[]; // All available images (prioritized over listingImage)
  listingId?: string; // For reactivation
  onPaymentSuccess: (paymentData: { isFeatured: boolean; paymentMethod: string; paymentId: string; subscriptionId?: string }) => void;
  onPaymentError?: (error: string) => void;
}

// Stripe Payment Form Component
function StripePaymentForm({
  clientSecret,
  subscriptionId,
  onSuccess,
  onError,
  onProcessingChange,
}: {
  clientSecret: string;
  subscriptionId?: string | null;
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
        // For subscriptions, check if we have subscriptionId
        // The subscriptionId is stored when subscription is created
        // Check if this is a subscription payment (subscriptionId passed as prop)
        // Note: paymentIntent.metadata might not be available in all cases
        const finalSubscriptionId = subscriptionId;
        if (finalSubscriptionId) {
          // This is a subscription payment - confirm it on backend to sync status
          console.log('✅ [Payment Modal] Subscription payment confirmed, syncing with backend:', {
            subscriptionId: finalSubscriptionId,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status
          });
          
          try {
            // Confirm subscription payment to sync status from Stripe
            await confirmSubscriptionPayment(finalSubscriptionId);
            console.log('✅ [Payment Modal] Subscription status synced successfully');
          } catch (confirmError: any) {
            console.error('⚠️ [Payment Modal] Failed to confirm subscription payment:', confirmError);
            // Continue anyway - webhook will handle it
          }
          
          onSuccess(finalSubscriptionId); // Pass subscriptionId as paymentId for compatibility
        } else {
          // This is a one-time payment - get payment method and confirm
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
  isSubscription = false,
  includesFeatured = false,
  listingId,
}: {
  amount: number;
  listingType: ListingTypeEnum;
  onSuccess: (paymentId: string, subscriptionId?: string) => void;
  onError: (error: string) => void;
  isSubscription?: boolean;
  includesFeatured?: boolean;
  listingId?: string;
}) {
  const [{ isPending }] = usePayPalScriptReducer();

  const createOrder = async (): Promise<string> => {
    try {
      // For subscriptions, create subscription instead of order
      if (isSubscription) {
        const { subscriptionId, approvalUrl } = await createPayPalSubscription({
          listingType: listingType as string,
          includesFeatured,
          listingId: listingId, // Pass listingId for reactivation
        });
        
        // For PayPal subscriptions, open approval URL in popup window
        if (approvalUrl) {
          // Store subscriptionId in sessionStorage for when user returns
          if (subscriptionId) {
            sessionStorage.setItem('pendingPayPalSubscriptionId', subscriptionId);
            sessionStorage.setItem('pendingPayPalApprovalUrl', approvalUrl);
          }
          
          // Open PayPal approval in popup window
          const width = 600;
          const height = 700;
          const left = (window.screen.width - width) / 2;
          const top = (window.screen.height - height) / 2;
          
          const popup = window.open(
            approvalUrl,
            'PayPalSubscription',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
          );
          
          // Store listingId for redirect flow (PayPal opens in same window)
          if (listingId) {
            sessionStorage.setItem('pendingListingId', listingId);
          }
          
          if (!popup) {
            // Popup blocked, fallback to redirect (PayPal opens in same window)
            window.location.href = approvalUrl;
            return 'redirecting';
          }
          
          // Listen for popup to close or redirect
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              // Check if subscription was approved by checking sessionStorage
              const approved = sessionStorage.getItem('paypalSubscriptionApproved');
              if (approved === 'true') {
                // Subscription approved, get the subscription ID
                const approvedSubscriptionId = sessionStorage.getItem('pendingPayPalSubscriptionId');
                if (approvedSubscriptionId) {
                  sessionStorage.removeItem('pendingPayPalSubscriptionId');
                  sessionStorage.removeItem('pendingPayPalApprovalUrl');
                  sessionStorage.removeItem('paypalSubscriptionApproved');
                  onSuccess(approvedSubscriptionId, approvedSubscriptionId);
                }
              }
            }
          }, 500);
          
          // Listen for messages from popup callback page
          const messageHandler = (event: MessageEvent) => {
            // Only accept messages from same origin (our callback page)
            if (event.origin === window.location.origin) {
              if (event.data.type === 'PAYPAL_SUBSCRIPTION_APPROVED') {
                clearInterval(checkPopup);
                window.removeEventListener('message', messageHandler);
                if (popup && !popup.closed) {
                  popup.close();
                }
                const approvedSubscriptionId = event.data.subscriptionId || sessionStorage.getItem('pendingPayPalSubscriptionId');
                if (approvedSubscriptionId) {
                  // Sync subscription status from PayPal
                  syncPayPalSubscription(approvedSubscriptionId)
                    .then(() => {
                      sessionStorage.removeItem('pendingPayPalSubscriptionId');
                      sessionStorage.removeItem('pendingPayPalApprovalUrl');
                      sessionStorage.removeItem('paypalSubscriptionApproved');
                      onSuccess(approvedSubscriptionId, approvedSubscriptionId);
                    })
                    .catch((error) => {
                      console.error('Failed to sync PayPal subscription status:', error);
                      // Still call onSuccess even if sync fails
                      sessionStorage.removeItem('pendingPayPalSubscriptionId');
                      sessionStorage.removeItem('pendingPayPalApprovalUrl');
                      sessionStorage.removeItem('paypalSubscriptionApproved');
                      onSuccess(approvedSubscriptionId, approvedSubscriptionId);
                    });
                }
              } else if (event.data.type === 'PAYPAL_SUBSCRIPTION_CANCELED') {
                clearInterval(checkPopup);
                window.removeEventListener('message', messageHandler);
                if (popup && !popup.closed) {
                  popup.close();
                }
                sessionStorage.removeItem('pendingPayPalSubscriptionId');
                sessionStorage.removeItem('pendingPayPalApprovalUrl');
                sessionStorage.removeItem('paypalSubscriptionApproved');
                onError('Subscription approval was canceled');
              }
            }
          };
          window.addEventListener('message', messageHandler);
          
          // Return a dummy order ID to satisfy TypeScript (won't be used since we use popup)
          return 'popup-opened';
        }
        throw new Error("No approval URL returned from PayPal subscription");
      } else {
        // For one-time payments, create order as before
        const { orderId } = await createPayPalOrder(amount, listingType, listingId);
        return orderId;
      }
    } catch (error: any) {
      onError(error.message || "Failed to create PayPal order/subscription");
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      // Only for one-time payments
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

  // For subscriptions, PayPal redirects to approval URL, so we don't need the button
  // But we'll still show it and handle the redirect in createOrder
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
  listingImages,
  listingId,
  onPaymentSuccess,
  onPaymentError,
}: ListingPaymentModalProps) {
  const [includeFeatured, setIncludeFeatured] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null); // For PUPPY_LITTER_LISTING subscriptions
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const priceBreakdown = getPriceBreakdown(listingType, includeFeatured);
  const duration = getListingDuration(listingType);
  const canAddFeatured = isFeaturedAddonEligible(listingType);
  const listingTypeName = getListingTypeDisplayName(listingType);

  // Debug logging
  useEffect(() => {
    if (open) {
      console.log('Payment Modal Debug:', {
        listingType,
        canAddFeatured,
        isEligible: isFeaturedAddonEligible(listingType),
        priceBreakdown,
      });
    }
  }, [open, listingType, canAddFeatured]);

  // Initialize Stripe payment intent when Stripe is selected or featured add-on changes
  useEffect(() => {
    if (open && paymentMethod === "stripe" && !stripeClientSecret && !isLoading) {
      initializeStripePayment();
    }
  }, [open, paymentMethod, includeFeatured]);

  const initializeStripePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const listingTypeValue = listingType as ListingTypeEnum | string;
      
      // NEW APPROACH: Check if listing type has a Stripe price ID or PayPal plan ID configured
      // If it has either, it's a subscription type
      const hasStripePrice = hasStripePriceId(listingTypeValue);
      const hasPayPalPlan = hasPayPalPlanId(listingTypeValue);
      const isSubscription = hasStripePrice || hasPayPalPlan;
      
      const stripePriceId = getStripePriceId(listingTypeValue, includeFeatured && canAddFeatured);
      const paypalPlanId = getPayPalPlanId(listingTypeValue, includeFeatured && canAddFeatured);
      
      console.log('🔔 [Payment Modal] Payment initialization - Using Price/Plan ID Check:', {
        listingType: listingTypeValue,
        hasStripePrice,
        hasPayPalPlan,
        isSubscription,
        stripePriceId,
        paypalPlanId,
        includesFeatured: includeFeatured && canAddFeatured,
        allConfiguredStripePriceIds: STRIPE_PRICE_IDS,
        allConfiguredPayPalPlanIds: PAYPAL_PLAN_IDS,
      });
      
      // If listing type has a Stripe price ID or PayPal plan ID, it's a subscription - create subscription
      if (isSubscription && (stripePriceId || paypalPlanId)) {
        console.log('🔔 [Payment Modal] Creating subscription setup for:', {
          listingType: listingTypeValue,
          stripePriceId,
          paypalPlanId,
          includesFeatured: includeFeatured && canAddFeatured,
        });
        
        const subscriptionResponse = await createStripeSubscription({
          listingType: listingTypeValue as string,
          includesFeatured: includeFeatured && canAddFeatured,
          listingId: listingId, // Pass listingId for reactivation
          // No paymentMethodId - Payment Element will collect it
        });
        
        if (subscriptionResponse.clientSecret) {
          setStripeClientSecret(subscriptionResponse.clientSecret);
          // Store subscription ID for later use - this is critical for linking to listing
          if (subscriptionResponse.subscriptionId) {
            setSubscriptionId(subscriptionResponse.subscriptionId);
            console.log('✅ [Payment Modal] Subscription created and stored:', {
              subscriptionId: subscriptionResponse.subscriptionId,
              listingType,
              includesFeatured: includeFeatured && canAddFeatured
            });
          } else {
            console.warn('⚠️ [Payment Modal] Subscription created but no subscriptionId returned');
          }
        } else {
          throw new Error('Subscription setup failed - no client secret returned');
        }
      } else {
        // For one-time payment listing types, create payment intent
        const amountToCharge = includeFeatured && canAddFeatured 
          ? priceBreakdown.total 
          : priceBreakdown.basePrice;
        const { clientSecret, paymentId } = await createPaymentIntent(
          amountToCharge,
          listingType
        );
        setStripeClientSecret(clientSecret);
        setPaymentId(paymentId);
      }
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
    // For subscription types, confirmedPaymentId is actually the subscriptionId
    // Pass both paymentId and subscriptionId for clarity
    const isSubscription = hasStripePriceId(listingType) || hasPayPalPlanId(listingType);
    onPaymentSuccess({
      isFeatured: includeFeatured,
      paymentMethod: "stripe",
      paymentId: isSubscription ? subscriptionId || confirmedPaymentId : confirmedPaymentId,
      subscriptionId: isSubscription ? (subscriptionId || confirmedPaymentId) : undefined,
    });
    handleClose();
  };

  const handlePayPalSuccess = (capturedPaymentId: string, subscriptionIdParam?: string) => {
    const isSubscription = hasStripePriceId(listingType) || hasPayPalPlanId(listingType);
    onPaymentSuccess({
      isFeatured: includeFeatured,
      paymentMethod: "paypal",
      paymentId: capturedPaymentId,
      subscriptionId: isSubscription ? (subscriptionIdParam || capturedPaymentId) : undefined,
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
    setSubscriptionId(null);
    setIncludeFeatured(false);
    setError(null);
    onOpenChange(false);
  };

  // Only allow closing via explicit close button, not via outside click or ESC
  const handleOpenChange = (newOpen: boolean) => {
    // Only process open changes (when opening), ignore close attempts from outside/ESC
    // The modal can only be closed via the handleClose function (close button)
    if (newOpen) {
      onOpenChange(newOpen);
    }
    // If newOpen is false, ignore it - this prevents closing from outside clicks or ESC
  };

  const stripePromise = getStripe();

  useEffect(() => {
    console.log('Payment modal open state:', open ," kjdsk");
    console.log('listingType:', listingType);
  }, [open, listingType]);

  const handlePayAndPublish = async () => {
    if (paymentMethod === "stripe") {
      const form = document.getElementById("stripe-payment-form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-[600px] w-full max-h-[95vh] overflow-y-auto p-0 bg-white rounded-xl shadow-xl border-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
                  {(() => {
                    // Prioritize first image from listingImages array, fall back to listingImage
                    const displayImage = listingImages && listingImages.length > 0 
                      ? listingImages[0] 
                      : listingImage;
                    
                    if (!displayImage) {
                      return (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Mail className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                      );
                    }
                    
                    if (isVideoUrl(displayImage)) {
                      // Show video thumbnail
                      return (
                        <video
                          src={displayImage}
                          className="absolute inset-0 w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                          controls={false}
                        />
                      );
                    }
                    
                    // Show image
                    return (
                      <Image
                        src={displayImage}
                        alt={listingTitle || "Listing"}
                        fill
                        className="object-cover"
                      />
                    );
                  })()}
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
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-0.5">{listingTypeName}</div>
                        <div className="text-xs text-gray-600">30 days</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{formatPrice(priceBreakdown.basePrice)}</div>
                      </div>
                    </div>
                    {includeFeatured && canAddFeatured && (
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-600">Featured Add-on (first month)</div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{formatPrice(priceBreakdown.addons[0]?.price || ADDON_PRICES.FEATURED_HOMEPAGE_GALLERY)}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t-2 border-gray-300">
                      <div className="text-sm font-semibold text-gray-900">Total to pay now</div>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                          {formatPrice(includeFeatured && canAddFeatured ? priceBreakdown.total : priceBreakdown.basePrice)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {hasStripePriceId(listingType) 
                            ? "Monthly subscription" 
                            : "One-time charge"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Add-on Option */}
          {canAddFeatured ? (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Add-ons</h3>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group hover:bg-blue-100 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={includeFeatured}
                  onChange={(e) => {
                    setIncludeFeatured(e.target.checked);
                    // Reinitialize payment if already selected to update amount
                    if (paymentMethod === "stripe" && stripeClientSecret) {
                      setStripeClientSecret(null);
                      setPaymentId(null);
                    }
                  }}
                  className="mt-1 w-5 h-5 text-[#635cff] border-2 border-gray-300 rounded focus:ring-[#635cff] focus:ring-2 cursor-pointer flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Featured & Homepage Gallery
                    </span>
                    <span className="text-sm font-bold text-[#635cff]">
                      +{formatPrice(priceBreakdown.addons[0]?.price || ADDON_PRICES.FEATURED_HOMEPAGE_GALLERY)}/mo
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Get your listing featured on the homepage and in the gallery. Recurring monthly subscription that you can cancel anytime.
                  </p>
                  {includeFeatured && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      <strong>Note:</strong> You'll pay {formatPrice(priceBreakdown.addons[0]?.price || ADDON_PRICES.FEATURED_HOMEPAGE_GALLERY)}/mo until you manually remove this add-on in your subscription settings.
                    </div>
                  )}
                </div>
              </label>
            </div>
          ) : null}

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
                  subscriptionId={subscriptionId}
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
                  amount={includeFeatured && canAddFeatured ? priceBreakdown.total : priceBreakdown.basePrice}
                  listingType={listingType}
                  onSuccess={(paymentId, subscriptionId) => {
                    handlePayPalSuccess(paymentId, subscriptionId);
                    // If subscriptionId is provided, store it
                    if (subscriptionId) {
                      setSubscriptionId(subscriptionId);
                    }
                  }}
                  onError={handleError}
                  isSubscription={hasStripePriceId(listingType) || hasPayPalPlanId(listingType)}
                  includesFeatured={includeFeatured && canAddFeatured}
                  listingId={listingId}
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

