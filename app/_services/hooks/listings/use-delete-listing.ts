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