"use client";

import { useState } from 'react';
import { DashboardLayout } from "@/_components/common/dashboard-layout";
import { AdminGuard } from "@/_components/common/admin-guard";
import { useGetAdminListings } from "@/_services/hooks/listings/use-get-admin-listings";
import { ListingStatusEnum, ListingSummaryDto } from "@/_types/listing";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/_components/ui/select";
import { Badge } from "@/_components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Search, Check, X, Eye, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useApproveListing } from "@/_services/hooks/listings/use-approve-listing";
import { useRejectListing } from "@/_services/hooks/listings/use-reject-listing";
import { toast } from "@/_hooks/use-toast";

const statusStyles: Record<string, string> = {
  active: "text-[#74D27E] bg-[#87D78E4D] border border-[#74D27E]",
  draft: "text-[#FFCE20] bg-[#EFC95133] border border-[#FFCE20]",
  pending_review: "text-white bg-[#FFCE20] border border-[#FFCE20]",
  expired: "text-white bg-[#EE5D50] border border-[#EE5D50]",
  suspended: "text-white bg-[#EE5D50] border border-[#EE5D50]",
};

function AdminListingsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: ListingStatusEnum.PENDING_REVIEW as ListingStatusEnum | undefined,
  });

  const { data, isLoading, error, refetch } = useGetAdminListings({
    status: filters.status,
    search: filters.search || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  const approveListing = useApproveListing();
  const rejectListing = useRejectListing();

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleApprove = async (listingId: string) => {
    try {
      await approveListing.mutateAsync(listingId);
      toast({
        title: 'Listing Approved',
        description: 'The listing has been approved and is now active.',
        variant: 'default',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error approving listing',
        description: error.message || 'Failed to approve listing.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (listingId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await rejectListing.mutateAsync({ listingId, reason: reason || undefined });
      toast({
        title: 'Listing Rejected',
        description: 'The listing has been rejected.',
        variant: 'default',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error rejecting listing',
        description: error.message || 'Failed to reject listing.',
        variant: 'destructive',
      });
    }
  };

  const getStatusDisplay = (status: ListingStatusEnum) => {
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
        return status;
    }
  };

  const getStatusStyle = (status: ListingStatusEnum) => {
    return statusStyles[status.toLowerCase()] || statusStyles.draft;
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <DashboardLayout title="Listing Management" showTimeFilter={false}>
          <div className="text-center py-8">
            <p>Loading listings...</p>
          </div>
        </DashboardLayout>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <DashboardLayout title="Listing Management" showTimeFilter={false}>
          <div className="text-center py-8">
            <p className="text-red-600">
              Error loading listings: {error.message}
            </p>
          </div>
        </DashboardLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <DashboardLayout title="Listing Management" showTimeFilter={false}>
        <div className="flex flex-col border border-black/20 rounded-[20px] pb-4">
          <div className="flex gap-4 items-center p-6 justify-between">
            <span className="text-[22px] font-semibold">Listings</span>
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search listings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value as ListingStatusEnum)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={ListingStatusEnum.PENDING_REVIEW}>Pending Review</SelectItem>
                  <SelectItem value={ListingStatusEnum.ACTIVE}>Active</SelectItem>
                  <SelectItem value={ListingStatusEnum.DRAFT}>Draft</SelectItem>
                  <SelectItem value={ListingStatusEnum.EXPIRED}>Expired</SelectItem>
                  <SelectItem value={ListingStatusEnum.SUSPENDED}>Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {data && data.data && data.data.length > 0 ? (
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
                    <th className="px-8 py-3 font-medium text-center">User</th>
                    <th className="px-8 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((listing: ListingSummaryDto) => (
                    <tr key={listing.id} className="border-b border-[#E9EDF7] hover:bg-gray-50">
                      <td className="px-8 py-4">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                          {listing.featuredImage ? (
                            <Image
                              src={listing.featuredImage}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {listing.description}
                        </div>
                      </td>
                      <td className="px-8 py-4">{listing.breed || 'N/A'}</td>
                      <td className="px-8 py-4">
                        {listing.price ? `$${listing.price}` : 'N/A'}
                      </td>
                      <td className="px-8 py-4">{listing.type}</td>
                      <td className="px-8 py-4 text-center">
                        <Badge className={getStatusStyle(listing.status)}>
                          {getStatusDisplay(listing.status)}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <div className="text-sm">
                          <div className="font-medium">{listing.user?.name || 'N/A'}</div>
                          <div className="text-gray-500">{listing.user?.email || ''}</div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex gap-2 justify-center items-center">
                          <Link href={`/explore/${listing.id}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          {listing.status === ListingStatusEnum.PENDING_REVIEW && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApprove(listing.id)}
                                disabled={approveListing.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(listing.id)}
                                disabled={rejectListing.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No listings found</p>
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-8 py-4 border-t border-[#E9EDF7]">
              <div className="text-sm text-gray-600">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data.total)} of {data.total} listings
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= data.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}

export default AdminListingsPage;

