import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

async function reactivateListing(id: string, subscriptionId?: string, paymentId?: string) {
  const response = await axios.post(`/listings/${id}/reactivate`, {
    subscriptionId,
    paymentId,
  });
  return response.data;
}

export const useReactivateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, subscriptionId, paymentId }: { id: string; subscriptionId?: string; paymentId?: string }) =>
      reactivateListing(id, subscriptionId, paymentId),
    onSuccess: (data, { id }) => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      
      toast({
        title: "Success",
        description: "Listing reactivated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to reactivate listing. Please try again.",
        variant: "destructive",
      });
    },
  });
};

