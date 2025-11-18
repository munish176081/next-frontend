"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/_components/ui/dialog";
import { getUserPayments, Payment } from "@/_lib/api/payments";
import { formatPrice } from "@/_lib/pricing";
import { Loader2 } from "lucide-react";
import { toast } from "@/_hooks/use-toast";

interface PaymentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower === "completed" || statusLower === "succeeded") {
    return "text-green-600 bg-green-50 border-green-200";
  }
  if (statusLower === "pending") {
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  }
  if (statusLower === "failed" || statusLower === "canceled") {
    return "text-red-600 bg-red-50 border-red-200";
  }
  return "text-gray-600 bg-gray-50 border-gray-200";
}

function getPaymentTypeLabel(payment: Payment): string {
  if (payment.listingType) {
    const typeMap: Record<string, string> = {
      SEMEN_LISTING: "Semen Listing",
      PUPPY_LISTING: "Puppy Listing",
      PUPPY_LITTER_LISTING: "Puppy Litter Listing",
      STUD_LISTING: "Stud Listing",
      FUTURE_LISTING: "Future Listing",
      WANTED_LISTING: "Wanted Listing",
      OTHER_SERVICES: "Other Services",
    };
    
    let type = typeMap[payment.listingType] || payment.listingType.replace(/_/g, " ");
    
    if (payment.isFeatured) {
      type += " + Featured";
    }
    
    return type;
  }
  
  return payment.isFeatured ? "Featured Listing" : "Listing Payment";
}

export function PaymentHistoryModal({ open, onOpenChange }: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadPayments();
    }
  }, [open]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Try syncing from Stripe first to get all payments
      let data = await getUserPayments(true);
      // If no payments found, try without sync
      if (data.length === 0) {
        data = await getUserPayments(false);
      }
      setPayments(data);
    } catch (err: any) {
      setError(err.message || "Failed to load payment history");
      toast({
        title: "Error",
        description: err.message || "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>
          <DialogDescription>
            View all your payment transactions and history
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No payment history found.</p>
          </div>
        ) : (
          <div className="mt-4">
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
                      PAYMENT METHOD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DATE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getPaymentTypeLabel(payment)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(payment.amount)} {payment.currency.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 capitalize">
                          {payment.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(payment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

