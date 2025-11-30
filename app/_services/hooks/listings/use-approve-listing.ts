import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingResponseDto } from '@/_types/listing';

async function approveListing(listingId: string): Promise<ListingResponseDto> {
  const { data } = await axios.post(`/listings/${listingId}/approve`);
  return data;
}

export const useApproveListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveListing,
    onSuccess: () => {
      // Invalidate listings queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
    },
  });
};

