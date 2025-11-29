import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

async function deleteListing(id: string) {
  await axios.delete(`/users/listings/${id}`);
}

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListing,
    onSuccess: (data, id) => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      queryClient.removeQueries({ queryKey: ['current-user-listing', id] });
      
      // Remove public listing cache (listing no longer exists)
      queryClient.removeQueries({ queryKey: ['public-listing', id] });
      
      // Invalidate related queries that might show this listing
      queryClient.invalidateQueries({ queryKey: ['similar-listings'] });
      queryClient.invalidateQueries({ queryKey: ['seller-listings'] });
      queryClient.invalidateQueries({ queryKey: ['search-listings'] });
      
      toast({
        title: "Success",
        description: "Listing deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    },
  });
}; 