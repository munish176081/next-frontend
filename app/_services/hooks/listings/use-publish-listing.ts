import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

async function publishListing(id: string) {
  const response = await axios.post(`/users/listings/${id}/publish`);
  return response.data;
}

export const usePublishListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishListing,
    onSuccess: (data, id) => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-listing', id] });
      
      toast({
        title: "Success",
        description: "Listing published successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to publish listing. Please try again.",
        variant: "destructive",
      });
    },
  });
}; 