import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingSummaryDto } from '@/_types/listing';

async function getPremiumListings(limit: number = 10): Promise<ListingSummaryDto[]> {
  const { data } = await axios.get(`/listings/premium?limit=${limit}`);
  return data;
}

export const usePremiumListings = (limit: number = 10) => {
  return useQuery({
    queryKey: ['premium-listings', limit],
    queryFn: () => getPremiumListings(limit),
  });
}; 