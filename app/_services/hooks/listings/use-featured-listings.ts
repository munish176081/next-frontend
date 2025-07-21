import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingSummaryDto } from '@/_types/listing';

async function getFeaturedListings(limit: number = 10): Promise<ListingSummaryDto[]> {
  const { data } = await axios.get(`/listings/featured?limit=${limit}`);
  return data;
}

export const useFeaturedListings = (limit: number = 10) => {
  return useQuery({
    queryKey: ['featured-listings', limit],
    queryFn: () => getFeaturedListings(limit),
  });
}; 