import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

interface GlobalListingStats {
  total: number;
  active: number;
  draft: number;
  expired: number;
  featured: number;
  premium: number;
}

async function getGlobalListingStats(): Promise<GlobalListingStats> {
  const { data } = await axios.get('/listings/stats/global');
  return data;
}

export const useGlobalListingStats = () => {
  return useQuery({
    queryKey: ['global-listing-stats'],
    queryFn: getGlobalListingStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 