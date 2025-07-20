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
    onSuccess: (data, { id }) => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-listing', id] });
      
      toast({
        title: "Success",
        description: "Listing updated successfully!",
      });
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