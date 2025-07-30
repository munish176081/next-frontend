import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { PaginatedListingsResponseDto, ListingTypeEnum, ListingCategoryEnum } from '@/_types/listing';

interface SearchParams {
  query?: string;
  type?: ListingTypeEnum;
  category?: ListingCategoryEnum;
  location?: string;
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

async function searchListings(params: SearchParams): Promise<PaginatedListingsResponseDto> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  // Use the regular listings endpoint which supports all filter parameters
  const { data } = await axios.get(`/listings?${searchParams.toString()}`);
  return data;
}

export const useSearchListings = (params: SearchParams) => {
  return useQuery({
    queryKey: ['search-listings', params],
    queryFn: () => searchListings(params),
    // Remove the enabled condition since query is now optional
  });
};
