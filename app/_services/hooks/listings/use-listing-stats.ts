import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

interface ListingStats {
  total: number;
  active: number;
  draft: number;
  expired: number;
  featured: number;
  premium: number;
}

async function getListingStats(): Promise<ListingStats> {
  const { data } = await axios.get('/listings/stats/my');
  return data;
}

export const useListingStats = () => {
  return useQuery({
    queryKey: ['listing-stats'],
    queryFn: getListingStats,
  });
}; 