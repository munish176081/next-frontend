import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingAvailabilityEnum } from '@/_types/listing';
import { toast } from '@/_hooks/use-toast';

async function updateAvailability({ id, availability }: { id: string; availability: ListingAvailabilityEnum }) {
  const response = await axios.put(`/users/listings/${id}/availability`, { availability });
  return response.data;
}

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvailability,
    onSuccess: (data, { id }) => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-user-listing', id] });
      
      toast({
        title: "Success",
        description: "Availability updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    },
  });
}; 