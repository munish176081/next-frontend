import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { PaginatedListingsResponseDto, ListingTypeEnum, ListingCategoryEnum } from '@/_types/listing';

interface SimilarListingsParams {
  breed?: string;
  type?: ListingTypeEnum;
  category?: ListingCategoryEnum;
  excludeId?: string; // Exclude current listing
  limit?: number;
}

async function getSimilarListings(params: SimilarListingsParams): Promise<PaginatedListingsResponseDto> {
  const searchParams = new URLSearchParams();
  
  // Add filters for similar listings
  if (params.breed) {
    searchParams.append('breed', params.breed);
  }
  if (params.type) {
    searchParams.append('type', params.type);
  }
  if (params.category) {
    searchParams.append('category', params.category);
  }
  if (params.excludeId) {
    searchParams.append('excludeId', params.excludeId);
  }
  
  // Set limit for similar listings (default to 4)
  searchParams.append('limit', (params.limit || 4).toString());
  searchParams.append('page', '1');
  
  // Only get active listings
  searchParams.append('status', 'active');

  const { data } = await axios.get(`/listings?${searchParams.toString()}`);
  return data;
}

export const useSimilarListings = (params: SimilarListingsParams) => {
  return useQuery({
    queryKey: ['similar-listings', params],
    queryFn: () => getSimilarListings(params),
    enabled: !!(params.breed || params.type || params.category), // Only run if we have at least one filter
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}; 