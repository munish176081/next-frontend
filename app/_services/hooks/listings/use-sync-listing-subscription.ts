import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingResponseDto } from '@/_types/listing';
import { toast } from '@/_hooks/use-toast';

async function syncListingSubscription(id: string): Promise<ListingResponseDto> {
  const response = await axios.post(`/listings/${id}/sync-subscription`);
  return response.data;
}

export const useSyncListingSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncListingSubscription,
    onSuccess: (data, id) => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      
      toast({
        title: "Success",
        description: "Subscription status synced successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to sync subscription status. Please try again.",
        variant: "destructive",
      });
    },
  });
};

