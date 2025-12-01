"use client";
import { Suspense, useState, useEffect, useRef } from "react";
import { useUserListings } from "@/_services/hooks/user/use-user-listings";
import { useDeleteListing } from "@/_services/hooks/listings/use-delete-listing";
import { usePublishListing } from "@/_services/hooks/listings/use-publish-listing";
import { useUpdateListing } from "@/_services/hooks/listings/use-update-listing";
import { useUpdateAvailability } from "@/_services/hooks/listings/use-update-availability";
import { ListingStatusEnum, ListingAvailabilityEnum } from "@/_types/listing";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { getShortCodeFromId } from "@/_config/listing-types";
import { getListingPricingDisplay } from "@/_utils/pricing";
import {
  FileText,
  Plus,
  Edit3,
  X,
  Check,
  Edit,
  MoreVertical,
  Trash2,
  Eye,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/_hooks/use-toast";
import Image from "next/image";
import { toTitleCaseFromId } from "@/_utils/listing";

const statusStyles = {
  Active: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]",
  Draft: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20]",
  "Pending Review": "text-white bg-[#FFCE20] border border-[#FFCE20]",
  "Payment Processing": "text-white bg-[#3B82F6] border border-[#3B82F6]",
  Pending: "text-white bg-[#FFCE20] border border-[#FFCE20]",
  Expired: "text-white bg-[#EE5D50] border border-[#EE5D50]",
  Suspended: "text-white bg-[#EE5D50] border border-[#EE5D50]",
};

const availabilityOptions = [
  { value: ListingAvailabilityEnum.AVAILABLE, label: "Available" },
  { value: ListingAvailabilityEnum.RESERVED, label: "Reserved" },
  { value: ListingAvailabilityEnum.SOLD_OUT, label: "Sold Out" },
  { value: ListingAvailabilityEnum.DRAFT, label: "Draft" },
];

function UserListingsPage() {
  const { data: listings, isLoading, error, refetch } = useUserListings();
  const deleteListingMutation = useDeleteListing();
  const publishListingMutation = usePublishListing();
  const updateListingMutation = useUpdateListing();
  const updateAvailabilityMutation = useUpdateAvailability();

  const [editingAvailability, setEditingAvailability] = useState<string | null>(
    null
  );
  const [newAvailability, setNewAvailability] =
    useState<ListingAvailabilityEnum>(ListingAvailabilityEnum.AVAILABLE);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await deleteListingMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Error deleting listing:", error);
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishListingMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Error publishing listing:", error);
    }
  };

  const handleEditAvailability = (
    listingId: string,
    currentAvailability: string
  ) => {
    setEditingAvailability(listingId);
    // Map display text back to enum value
    const availabilityMap: Record<string, ListingAvailabilityEnum> = {
      Available: ListingAvailabilityEnum.AVAILABLE,
      Reserved: ListingAvailabilityEnum.RESERVED,
      "Sold Out": ListingAvailabilityEnum.SOLD_OUT,
      Draft: ListingAvailabilityEnum.DRAFT,
    };
    setNewAvailability(
      availabilityMap[currentAvailability] || ListingAvailabilityEnum.AVAILABLE
    );
  };

  const handleSaveAvailability = async (listingId: string) => {
    try {
      const listing = listings?.find((l) => l.id === listingId);
      if (!listing) return;

      console.log(
        "Updating availability for listing:",
        listingId,
        "to:",
        newAvailability
      );
      console.log("Current metadata:", listing.metadata);

      await updateAvailabilityMutation.mutateAsync({
        id: listingId,
        availability: newAvailability,
      });

      setEditingAvailability(null);
      setNewAvailability(ListingAvailabilityEnum.AVAILABLE); // Reset to default
      refetch();

      toast({
        title: "Success",
        description: `Availability updated to ${newAvailability}`,
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingAvailability(null);
    setNewAvailability(ListingAvailabilityEnum.AVAILABLE); // Reset to default
  };

  const toggleDropdown = (listingId: string) => {
    setOpenDropdown(openDropdown === listingId ? null : listingId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const getDropdownPosition = (listingId: string) => {
    // For now, we'll use a simple approach
    // In a more complex implementation, you could check the element's position
    return "bottom";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdown &&
        !(event.target as Element).closest(".dropdown-container")
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const getStatusDisplay = (status: ListingStatusEnum, subscriptionId?: string | null) => {
    // If listing has subscriptionId and status is DRAFT, it's payment processing
    // This means payment was made but webhook hasn't processed yet
    if (subscriptionId && status === ListingStatusEnum.DRAFT) {
      return "Payment Processing";
    }
    
    switch (status) {
      case ListingStatusEnum.ACTIVE:
        return "Active";
      case ListingStatusEnum.DRAFT:
        return "Draft";
      case ListingStatusEnum.PENDING_REVIEW:
        return "Pending Review";
      case ListingStatusEnum.EXPIRED:
        return "Expired";
      case ListingStatusEnum.SUSPENDED:
        return "Suspended";
      default:
        return "Draft";
    }
  };

  const isPaymentProcessing = (listing: any): boolean => {
    return !!(listing.subscriptionId && listing.status === ListingStatusEnum.DRAFT);
  };

  const getAvailabilityStatus = (listing: any) => {
    // Use the new availability field if it exists
    if (listing.availability) {
      switch (listing.availability) {
        case ListingAvailabilityEnum.AVAILABLE:
          return "Available";
        case ListingAvailabilityEnum.RESERVED:
          return "Reserved";
        case ListingAvailabilityEnum.SOLD_OUT:
          return "Sold Out";
        case ListingAvailabilityEnum.DRAFT:
          return "Draft";
        default:
          return "Available";
      }
    }

    // Fallback to status-based availability (for backward compatibility)
    switch (listing.status) {
      case ListingStatusEnum.ACTIVE:
        return "Available";
      case ListingStatusEnum.DRAFT:
        return "Draft";
      case ListingStatusEnum.EXPIRED:
        return "Expired";
      case ListingStatusEnum.SUSPENDED:
        return "Suspended";
      default:
        return "Draft";
    }
  };

  const getDaysUntilExpiry = (renewalDate?: string | Date): number | null => {
    if (!renewalDate) return null;
    const expiryDate = new Date(renewalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  const isExpiringSoon = (renewalDate?: string | Date): boolean => {
    const daysLeft = getDaysUntilExpiry(renewalDate);
    return daysLeft !== null && daysLeft >= 2 && daysLeft <= 3;
  };

  const getRenewalDate = (listing: any): Date | null => {
    // Prefer subscription renewal date, fallback to listing expiration date
    return listing.subscriptionRenewalDate 
      ? new Date(listing.subscriptionRenewalDate)
      : (listing.expiresAt ? new Date(listing.expiresAt) : null);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Listings" showTimeFilter={false}>
        <div className="text-center py-8">
          <p>Loading your listings...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Listings" showTimeFilter={false}>
        <div className="text-center py-8">
          <p className="text-red-600">
            Error loading listings: {error.message}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const expiringListings = listings?.filter(listing => {
    const renewalDate = getRenewalDate(listing);
    return renewalDate && isExpiringSoon(renewalDate) && listing.status === ListingStatusEnum.ACTIVE;
  }) || [];

  return (
    <DashboardLayout title="My Listings" showTimeFilter={false}>
      <div className="flex flex-col border border-black/20 rounded-[20px] pb-4">
        <div className="flex gap-4 items-center p-6 justify-between">
          <span className="text-[22px] font-semibold">Listings</span>
          <div className="flex h-10 rounded-full border border-black/20 text-xs gap-3 items-center px-6 cursor-pointer justify-center">
            <img className="w-4" src="/images/vectors/filter.png" /> Filter
          </div>
        </div>

        {expiringListings.length > 0 && (
          <div className="mx-6 mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Listings Expiring Soon
                </h3>
                <p className="text-xs text-amber-700">
                  {expiringListings.length} listing{expiringListings.length !== 1 ? 's' : ''} {expiringListings.length === 1 ? 'is' : 'are'} about to expire in 23-30 days. {expiringListings.length === 1 ? 'It will' : 'They will'} be automatically renewed on {expiringListings[0] ? (getRenewalDate(expiringListings[0])?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || 'the renewal date') : 'the renewal date'}.
                </p>
              </div>
            </div>
          </div>
        )}

        {listings && listings.length > 0 ? (
          <div className="overflow-x-auto overflow-y-visible w-full min-h-[400px] relative">
            <table className="w-full text-left">
              <thead className="text-[#A3AED0] text-sm border-b border-[#E9EDF7]">
                <tr>
                  <th className="px-8 py-3 font-medium">Image</th>
                  <th className="px-8 py-3 font-medium">Title</th>
                  <th className="px-8 py-3 font-medium">Breed</th>
                  <th className="px-8 py-3 font-medium">Price</th>
                  <th className="px-8 py-3 font-medium">Type</th>
                  <th className="px-8 py-3 font-medium text-center">Status</th>
                  <th className="px-8 py-3 font-medium text-center">
                    Availability
                  </th>
                  {/* <th className="px-8 py-3 font-medium text-center">Payment</th> */}
                  <th className="px-8 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing, index) => {
                  const renewalDate = getRenewalDate(listing);
                  const daysLeft = renewalDate ? getDaysUntilExpiry(renewalDate) : null;
                  const expiringSoon = renewalDate ? isExpiringSoon(renewalDate) : false;
                  
                  // Debug: Log listing data for payment processing detection
                  if (listing.status === ListingStatusEnum.DRAFT) {
                    console.log('🔍 [Listings Page] Draft listing check:', {
                      id: listing.id,
                      title: listing.title,
                      status: listing.status,
                      subscriptionId: listing.subscriptionId,
                      hasSubscriptionId: !!listing.subscriptionId,
                      shouldShowProcessing: !!(listing.subscriptionId && listing.status === ListingStatusEnum.DRAFT),
                    });
                  }
                  
                  return (
                  <tr key={listing.id} className={expiringSoon ? "bg-amber-50/50" : ""}>
                    <td className="px-8 py-3 text-sm font-medium">
                    <Link
                        href={`/explore/${listing.id}`}
                      > 
                      <span className="w-20 h-20 flex rounded-xl overflow-hidden">
                        {listing.featuredImage ||
                          listing.metadata?.images?.[0] ? (
                          <Image
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            src={
                              listing.featuredImage ||
                              listing.metadata.images[0]
                            }
                            alt={listing.title || "Listing"}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </span>
                      </Link>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/explore/${listing.id}`}
                        > 
                          {listing.title || "Untitled Listing"}
                        </Link>
                        {expiringSoon && renewalDate && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-300 rounded-md">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span className="text-[10px] font-medium text-amber-700">
                              Renews {renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">
                      {listing.breed || "N/A"}
                    </td>
                    <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">
                      {(() => {
                        const pricingResult = getListingPricingDisplay({
                          price: listing.price,
                          fields: listing.fields || {},
                          type: listing.type
                        });
                        console.log(pricingResult, listing.fields, listing.price, "SUSHIL"  ) ;
                        return pricingResult.hasError ? "N/A" : pricingResult.displayText;
                      })()}
                    </td>
                    <td className="px-8 py-3 text-sm font-medium whitespace-nowrap">
                      {listing.type === 'PUPPY_LITTER_LISTING'
                        ? "Litter Listing"
                        : toTitleCaseFromId(listing.type)}
                    </td>
                    <td className="px-8 py-3 text-sm font-medium whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const paymentProcessing = isPaymentProcessing(listing);
                          const statusDisplay = getStatusDisplay(listing.status, listing.subscriptionId);
                          
                          // Debug logging for payment processing detection
                          if (listing.status === ListingStatusEnum.DRAFT) {
                            console.log('🔍 [Listings Page] Draft listing check:', {
                              id: listing.id,
                              title: listing.title?.substring(0, 20),
                              status: listing.status,
                              subscriptionId: listing.subscriptionId,
                              hasSubscriptionId: !!listing.subscriptionId,
                              paymentProcessing,
                              statusDisplay,
                              fullListing: listing,
                            });
                          }
                          
                          return (
                            <>
                              <span
                                className={`min-h-6 text-[10px] rounded-full px-3 py-1 flex items-center justify-center whitespace-nowrap ${statusStyles[statusDisplay as keyof typeof statusStyles] || statusStyles.Draft}`}
                              >
                                {statusDisplay}
                              </span>
                              {paymentProcessing && (
                                <button
                                  onClick={() => {
                                    console.log('🔄 [Listings Page] Refreshing listings...');
                                    refetch();
                                  }}
                                  disabled={isLoading}
                                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Refresh status"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-8 py-3 text-sm font-medium whitespace-nowrap text-center">
                      {editingAvailability === listing.id ? (
                        <div className="flex items-center gap-2 justify-center">
                          <select
                            value={newAvailability}
                            onChange={(e) =>
                              setNewAvailability(
                                e.target.value as ListingAvailabilityEnum
                              )
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {availabilityOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSaveAvailability(listing.id)}
                            disabled={updateAvailabilityMutation.isPending}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          <span>{getAvailabilityStatus(listing)}</span>
                          <button
                            onClick={() =>
                              handleEditAvailability(
                                listing.id,
                                getAvailabilityStatus(listing)
                              )
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    {/* <td className="px-8 py-3 text-sm font-medium whitespace-nowrap text-center">
                      {listing.paymentId ? (
                        <span className="min-h-6 text-[10px] rounded-full w-16 mx-auto flex items-center justify-center text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]">
                          Paid
                        </span>
                      ) : (
                        <span className="min-h-6 text-[10px] rounded-full w-16 mx-auto flex items-center justify-center text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20]">
                          Unpaid
                        </span>
                      )}
                    </td> */}
                    <td className="px-8 py-3 text-sm font-medium whitespace-nowrap text-center">
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => toggleDropdown(listing.id)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Image
                            src="/icons/action-icon.png"
                            alt="more-vertical"
                            width={20}
                            height={20}
                          />
                        </button>

                        {openDropdown === listing.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[140px]">
                            <div className="py-1 relative">
                              {/* Add a small arrow pointing up */}
                              <div className="absolute -top-1 right-3 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                              <Link
                                href={`/startlistingform?edit=${listing.id}&type=${getShortCodeFromId(listing.type)}`}
                              >
                                <button
                                  onClick={closeDropdown}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </button>
                              </Link>

                              <Link href={`/explore/${listing.id}`}>
                                <button
                                  onClick={closeDropdown}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </button>
                              </Link>

                              {/* {listing.status === ListingStatusEnum.DRAFT && (
                                <button
                                  onClick={() => {
                                    handlePublish(listing.id);
                                    closeDropdown();
                                  }}
                                  disabled={publishListingMutation.isPending}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Check className="w-3 h-3" />
                                  {publishListingMutation.isPending
                                    ? "Publishing..."
                                    : "Publish"}
                                </button>
                              )} */}

                              <button
                                onClick={() => {
                                  handleDelete(listing.id);
                                  closeDropdown();
                                }}
                                disabled={deleteListingMutation.isPending}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
                              >
                                <Trash2 className="w-3 h-3" />
                                {deleteListingMutation.isPending
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              You haven't created any listings yet.
            </p>
            <Link href="/startlisting">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                <Plus className="w-4 h-4" />
                Create Your First Listing
              </button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UserListingsPage />
    </Suspense>
  );
}
