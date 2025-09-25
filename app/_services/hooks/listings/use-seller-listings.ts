import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { PaginatedListingsResponseDto } from '@/_types/listing';

interface SellerListingsParams {
  userId: string;
  excludeId?: string; // Exclude current listing
  limit?: number;
}

async function getSellerListings(params: SellerListingsParams): Promise<PaginatedListingsResponseDto> {
  const searchParams = new URLSearchParams();
  
  // Add filters for seller listings
  searchParams.append('userId', params.userId);
  if (params.excludeId) {
    searchParams.append('excludeId', params.excludeId);
  }
  
  // Set limit for seller listings (default to 4)
  searchParams.append('limit', (params.limit || 4).toString());
  searchParams.append('page', '1');
  
  // Only get active listings
  searchParams.append('status', 'active');

  const { data } = await axios.get(`/listings?${searchParams.toString()}`);
  return data;
}

export const useSellerListings = (params: SellerListingsParams) => {
  return useQuery({
    queryKey: ['seller-listings', params],
    queryFn: () => getSellerListings(params),
    enabled: !!params.userId, // Only run if we have a userId
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
