import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { PaginatedListingsResponseDto, ListingTypeEnum, ListingCategoryEnum } from '@/_types/listing';

interface SearchParams {
  query?: string;
  search?: string; // Support both query and search for backward compatibility
  type?: ListingTypeEnum;
  types?: ListingTypeEnum[]; // Support multiple types
  category?: ListingCategoryEnum;
  location?: string;
  address?: string; // Support both location and address
  breed?: string;
  minPrice?: number;
  maxPrice?: number;
  priceType?: 'price_on_request' | 'price_range' | 'price_available';
  priceTypes?: ('price_on_request' | 'price_range' | 'price_available')[];
  page?: number;
  limit?: number;
}

async function searchListings(params: SearchParams): Promise<PaginatedListingsResponseDto> {
  const searchParams = new URLSearchParams();
  
  // Map frontend parameters to API parameters
  // The /listings endpoint expects 'search' not 'query'
  const searchValue = params.query?.trim() || params.search?.trim();
  if (searchValue) {
    searchParams.append('search', searchValue);
  }
  
  if (params.type) {
    searchParams.append('type', params.type);
  }
  
  if (params.types && params.types.length > 0) {
    params.types.forEach(type => {
      searchParams.append('types', type);
    });
  }
  
  if (params.category) {
    searchParams.append('category', params.category);
  }
  
  if (params.location) {
    searchParams.append('location', params.location);
  } else if (params.address) {
    searchParams.append('location', params.address);
  }
  
  if (params.breed) {
    searchParams.append('breed', params.breed);
  }
  
  if (params.minPrice !== undefined) {
    searchParams.append('minPrice', params.minPrice.toString());
  }
  
  if (params.maxPrice !== undefined) {
    searchParams.append('maxPrice', params.maxPrice.toString());
  }
  
  if (params.priceType) {
    searchParams.append('priceType', params.priceType);
  }
  
  if (params.priceTypes && params.priceTypes.length > 0) {
    params.priceTypes.forEach(priceType => {
      searchParams.append('priceTypes', priceType);
    });
  }
  
  if (params.page !== undefined) {
    searchParams.append('page', params.page.toString());
  }
  
  if (params.limit !== undefined) {
    searchParams.append('limit', params.limit.toString());
  }

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
