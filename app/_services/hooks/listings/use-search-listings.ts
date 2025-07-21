import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { PaginatedListingsResponseDto, ListingTypeEnum, ListingCategoryEnum } from '@/_types/listing';

interface SearchParams {
  query: string;
  type?: ListingTypeEnum;
  category?: ListingCategoryEnum;
  location?: string;
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

  const { data } = await axios.get(`/listings/search?${searchParams.toString()}`);
  return data;
}

export const useSearchListings = (params: SearchParams) => {
  return useQuery({
    queryKey: ['search-listings', params],
    queryFn: () => searchListings(params),
    enabled: !!params.query,
  });
};
