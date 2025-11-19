"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import {
  getUserSubscriptions,
  cancelSubscription,
  updateSubscription,
  Subscription,
} from "@/_lib/api/subscriptions";
import { toast } from "@/_hooks/use-toast";
import { formatPrice } from "@/_lib/pricing";
import { AlertCircle, CreditCard, Loader2, History } from "lucide-react";
import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/_components/ui/dialog";
import { PaymentHistoryModal } from "./_components/payment-history-modal";

const statusStyles: Record<string, string> = {
  active: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]",
  cancelling: "text-orange-600 bg-orange-100 border border-orange-300",
  cancelled: "text-gray-600 bg-gray-100 border border-gray-300",
  expired: "text-white bg-[#EE5D50] border border-[#EE5D50]",
  past_due: "text-white bg-orange-500 border border-orange-500",
  trialing: "text-blue-600 bg-blue-100 border border-blue-300",
  incomplete: "text-yellow-600 bg-yellow-100 border border-yellow-300",
  incomplete_expired: "text-gray-600 bg-gray-100 border border-gray-300",
  unpaid: "text-red-600 bg-red-100 border border-red-300",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(status: string, cancelAtPeriodEnd?: boolean): string {
  if (cancelAtPeriodEnd && status === "active") {
    return "Cancelling";
  }
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusStyle(status: string, cancelAtPeriodEnd?: boolean): string {
  if (cancelAtPeriodEnd && status === "active") {
    return statusStyles.cancelling;
  }
  return statusStyles[status] || statusStyles.cancelled;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async (syncFromStripe: boolean = true) => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch from Stripe and sync with database by default
      const data = await getUserSubscriptions(syncFromStripe);
      setSubscriptions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subscriptions");
      // Fallback to database-only if Stripe sync fails
      if (syncFromStripe) {
        try {
          const data = await getUserSubscriptions(false);
          setSubscriptions(data);
          setError(null);
        } catch (fallbackErr: any) {
          toast({
            title: "Error",
            description: fallbackErr.message || "Failed to load subscriptions",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: err.message || "Failed to load subscriptions",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async (cancelAtPeriodEnd: boolean = true) => {
    if (!selectedSubscription) return;

    try {
      setIsCancelling(true);
      await cancelSubscription(selectedSubscription.id, cancelAtPeriodEnd);
      toast({
        title: "Success",
        description: cancelAtPeriodEnd
          ? "Subscription will be cancelled at the end of the current period"
          : "Subscription cancelled immediately",
      });
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
      await loadSubscriptions();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRemoveFeatured = async (subscription: Subscription) => {
    if (!subscription.includesFeatured) return;

    try {
      setIsUpdating(true);
      await updateSubscription(subscription.id, false);
      toast({
        title: "Success",
        description: "Featured add-on removed from subscription",
      });
      await loadSubscriptions();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddFeatured = async (subscription: Subscription) => {
    if (subscription.includesFeatured) return;

    try {
      setIsUpdating(true);
      await updateSubscription(subscription.id, true);
      toast({
        title: "Success",
        description: "Featured add-on added to subscription",
      });
      await loadSubscriptions();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getSubscriptionType = (subscription: Subscription): string => {
    if (!subscription.listingType) return "Subscription";
    
    const typeMap: Record<string, string> = {
      SEMEN_LISTING: "Semen Listing",
      PUPPY_LISTING: "Puppy Listing",
      PUPPY_LITTER_LISTING: "Puppy Litter Listing",
      STUD_LISTING: "Stud Listing",
      FUTURE_LISTING: "Future Listing",
      WANTED_LISTING: "Wanted Listing",
      OTHER_SERVICES: "Other Services",
    };
    
    let type = typeMap[subscription.listingType] || subscription.listingType.replace(/_/g, " ");
    
    if (subscription.includesFeatured) {
      type += " + Featured";
    }
    
    return type;
  };

  // Filter subscriptions into active and cancelled
  const activeSubscriptions = subscriptions.filter(
    (sub) =>
      sub.status !== "incomplete" &&
      sub.status !== "incomplete_expired" &&
      sub.status !== "cancelled" &&
      sub.status !== "expired"
  );

  // Separate cancelled subscriptions
  const cancelledSubscriptions = subscriptions.filter(
    (sub) => sub.status === "cancelled" || sub.status === "expired"
  );

  // Check if subscription can be managed (has actionable status)
  const canManageSubscription = (subscription: Subscription): boolean => {
    return (
      subscription.status === "active" ||
      subscription.status === "trialing" ||
      subscription.status === "past_due"
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Subscriptions</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your active subscriptions and payment methods
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setPaymentHistoryOpen(true)}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            Payment History
          </Button>
        </div>

        {activeSubscriptions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscriptions</h3>
            <p className="text-sm text-gray-600">
              You don't have any active subscriptions yet.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      AMOUNT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      START DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      END DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getSubscriptionType(subscription)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(subscription.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(subscription.currentPeriodStart)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(subscription.currentPeriodEnd)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusStyle(subscription.status, subscription.cancelAtPeriodEnd)
                          }`}
                        >
                          {getStatusLabel(subscription.status, subscription.cancelAtPeriodEnd)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {canManageSubscription(subscription) ? (
                          <div className="flex items-center gap-2">
                            {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
                              <>
                                {subscription.includesFeatured && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFeatured(subscription)}
                                    disabled={isUpdating}
                                    className="text-xs h-7"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "Remove Featured"
                                    )}
                                  </Button>
                                )}
                                {!subscription.includesFeatured &&
                                  (subscription.listingType === "PUPPY_LISTING" ||
                                    subscription.listingType === "PUPPY_LITTER_LISTING") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAddFeatured(subscription)}
                                      disabled={isUpdating}
                                      className="text-xs h-7"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        "Add Featured"
                                      )}
                                    </Button>
                                  )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelClick(subscription)}
                                  className="text-xs h-7 text-red-600 hover:text-red-700"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {subscription.status === "active" && subscription.cancelAtPeriodEnd && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    setIsCancelling(true);
                                    await cancelSubscription(subscription.id, false);
                                    toast({
                                      title: "Success",
                                      description: "Subscription reactivated successfully",
                                    });
                                    await loadSubscriptions();
                                  } catch (err: any) {
                                    toast({
                                      title: "Error",
                                      description: err.message || "Failed to reactivate subscription",
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setIsCancelling(false);
                                  }
                                }}
                                disabled={isCancelling}
                                className="text-xs h-7 text-green-600 hover:text-green-700"
                              >
                                {isCancelling ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Reactivate"
                                )}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cancelled Subscriptions Section */}
        {cancelledSubscriptions.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cancelled Subscriptions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Your cancelled and expired subscriptions
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        TYPE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        AMOUNT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        START DATE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        END DATE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        CANCELLED AT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cancelledSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getSubscriptionType(subscription)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatPrice(subscription.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(subscription.currentPeriodStart)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(subscription.currentPeriodEnd)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {subscription.canceledAt
                              ? formatDate(subscription.canceledAt)
                              : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getStatusStyle(subscription.status, subscription.cancelAtPeriodEnd)
                            }`}
                          >
                            {getStatusLabel(subscription.status, subscription.cancelAtPeriodEnd)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this subscription?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Subscription:</strong>{" "}
                  {selectedSubscription?.listingType?.replace(/_/g, " ") || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Amount:</strong> {formatPrice(selectedSubscription?.amount || 0)}/
                  {selectedSubscription?.currency?.toLowerCase() || "usd"}/mo
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Next renewal:</strong>{" "}
                  {selectedSubscription
                    ? formatDate(selectedSubscription.currentPeriodEnd)
                    : "N/A"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleCancelConfirm(true)}
                  disabled={isCancelling}
                  className="flex-1"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel at Period End"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelConfirm(false)}
                  disabled={isCancelling}
                  className="flex-1"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Immediately"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment History Modal */}
        <PaymentHistoryModal
          open={paymentHistoryOpen}
          onOpenChange={setPaymentHistoryOpen}
        />
      </div>
    </DashboardLayout>
  );
}

