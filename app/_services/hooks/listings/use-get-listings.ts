import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { PaginatedListingsResponseDto, ListingTypeEnum, ListingCategoryEnum, ListingStatusEnum } from '@/_types/listing';

interface GetListingsParams {
  search?: string;
  type?: ListingTypeEnum;
  category?: ListingCategoryEnum;
  status?: ListingStatusEnum;
  breed?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  priceType?: 'price_on_request' | 'price_range' | 'price_available';
  isFeatured?: boolean;
  isPremium?: boolean;
  tags?: string[];
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'viewCount' | 'favoriteCount';
  sortOrder?: 'ASC' | 'DESC';
  includeExpired?: boolean;
  includeDrafts?: boolean;
}

async function getListings(params: GetListingsParams = {}): Promise<PaginatedListingsResponseDto> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  const { data } = await axios.get(`/listings?${searchParams.toString()}`);
  return data;
}

export const useGetListings = (params: GetListingsParams = {}) => {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => getListings(params),
  });
}; 