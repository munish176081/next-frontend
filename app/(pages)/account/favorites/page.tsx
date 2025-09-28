"use client";

import { useState } from "react";
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { DashboardCard, DashboardTable } from "@/_components/common/dashboard-widgets";
import { useWishlistItems } from "@/_services/hooks/wishlist/use-wishlist-items";
import { useWishlist } from "@/_contexts/wishlist-context";
import { toast } from "@/_hooks/use-toast";
import { MoreHorizontal, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const Favorites = () => {
  const router = useRouter();
  const { removeFromWishlist } = useWishlist();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  
  // Fetch wishlist items
  const { data: wishlistData, isLoading, error, refetch } = useWishlistItems({
    page: 1,
    limit: 50, // Show more items in dashboard
  });

  // Transform wishlist data to table format
  const favoriteRows = wishlistData?.items?.map((item) => ({
    title: item.listing.title,
    breeder: item.listing.breed || "Unknown Breed",
    price: item.listing.price ? `$${item.listing.price}` : "Price on Request",
    added: new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    status: "Available", // You might want to add status to the listing data
    action: item.id,
    // Keep these for internal use but don't include in table display
    _id: item.id,
    _listingId: item.listingId,
  })) || [];

  const handleRemoveFromWishlist = async (wishlistItemId: string, listingId: string) => {
    setIsRemoving(wishlistItemId);
    try {
      await removeFromWishlist(listingId);
      toast({
        title: "Removed from Favorites",
        description: "Item has been removed from your favorites.",
      });
      refetch(); // Refresh the data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from favorites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  const handleViewListing = (listingId: string) => {
    router.push(`/explore/${listingId}`);
  };

  // Custom action component for the table
  const ActionButtons = ({ wishlistItemId, listingId }: { wishlistItemId: string; listingId: string }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleViewListing(listingId)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="View Listing"
      >
        <Eye className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={() => handleRemoveFromWishlist(wishlistItemId, listingId)}
        disabled={isRemoving === wishlistItemId}
        className="p-1 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
        title="Remove from Favorites"
      >
        {isRemoving === wishlistItemId ? (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4 text-red-500" />
        )}
      </button>
    </div>
  );

  // Enhanced table data with action buttons
  const enhancedFavoriteRows = favoriteRows.map((row) => {
    const { _id, _listingId, ...displayData } = row;
    return {
      ...displayData,
      action: <ActionButtons wishlistItemId={_id} listingId={_listingId} />,
    };
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Favorites" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="Saved Items" className="w-full">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Favorites" showTimeFilter={false}>
        <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
          <div className="flex flex-col w-full gap-4">
            <DashboardCard title="Saved Items" className="w-full">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-500 mb-4">Failed to load favorites</p>
                  <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Favorites" showTimeFilter={false}>
      <div className="flex gap-4 min-w-min max-md:flex-col max-md:min-w-full">
        <div className="flex flex-col w-full gap-4">
          <DashboardCard title="Saved Items" className="w-full">
            {enhancedFavoriteRows.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No favorites yet</p>
                  <p className="text-sm text-gray-400">Start exploring listings and add them to your favorites!</p>
                </div>
              </div>
            ) : (
              <DashboardTable
                headers={["TITLE", "BREED", "PRICE", "ADDED", "STATUS", "ACTION"]}
                data={enhancedFavoriteRows}
              />
            )}
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Favorites; 