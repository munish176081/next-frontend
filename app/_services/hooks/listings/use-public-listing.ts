import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingResponseDto } from '@/_types/listing';

async function getPublicListingById(id: string): Promise<ListingResponseDto> {
  const { data } = await axios.get(`/listings/${id}?incrementView=true`);
  return data;
}

export const usePublicListing = (id: string | null) => {
  return useQuery({
    queryKey: ['public-listing', id],
    queryFn: () => getPublicListingById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}; 