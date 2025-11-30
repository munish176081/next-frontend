import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingResponseDto } from '@/_types/listing';

interface RejectListingParams {
  listingId: string;
  reason?: string;
}

async function rejectListing({ listingId, reason }: RejectListingParams): Promise<ListingResponseDto> {
  const { data } = await axios.post(`/listings/${listingId}/reject`, { reason });
  return data;
}

export const useRejectListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectListing,
    onSuccess: () => {
      // Invalidate listings queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
    },
  });
};

