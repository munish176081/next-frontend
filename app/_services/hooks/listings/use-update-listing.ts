import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { UpdateListingDto } from '@/_types/listing';
import { toast } from '@/_hooks/use-toast';

async function updateListing({ id, data }: { id: string; data: UpdateListingDto }) {
  const response = await axios.put(`/users/listings/${id}`, data);
  return response.data;
}

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateListing,
    onSuccess: (data, { id, data: updateData }) => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] }); // Backup invalidation for any remaining usage
      
      // Invalidate and refetch public listing cache (used by explore detail page)
      queryClient.invalidateQueries({ queryKey: ['public-listing', id] });
      queryClient.refetchQueries({ queryKey: ['public-listing', id] });
      
      // Invalidate related queries that might show this listing
      queryClient.invalidateQueries({ queryKey: ['similar-listings'] });
      queryClient.invalidateQueries({ queryKey: ['seller-listings'] });
      queryClient.invalidateQueries({ queryKey: ['search-listings'] });
      
      // Don't show default toast if this is a payment activation (has subscriptionId or paymentId)
      // The form will show a custom "Payment Successful!" toast instead
      const isPaymentActivation = (updateData as any)?.subscriptionId || (updateData as any)?.paymentId;
      
      if (!isPaymentActivation) {
        toast({
          title: "Success",
          description: "Listing updated successfully!",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update listing. Please try again.",
        variant: "destructive",
      });
    },
  });
}; 