import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { CreateListingDto } from '@/_types/listing';
import { toast } from '@/_hooks/use-toast';

async function createListing(data: CreateListingDto) {
  const response = await axios.post('/users/listings', data);
  return response.data;
}

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      // Invalidate and refetch user listings
      queryClient.invalidateQueries({ queryKey: ['current-user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing-stats'] });
      
      // toast({
      //   title: "Success",
      //   description: "Listing created successfully!",
      // });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });
};
