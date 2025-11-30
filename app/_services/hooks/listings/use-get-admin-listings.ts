import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { PaginatedListingsResponseDto, ListingTypeEnum, ListingCategoryEnum, ListingStatusEnum } from '@/_types/listing';

interface GetAdminListingsParams {
  search?: string;
  type?: ListingTypeEnum;
  types?: ListingTypeEnum[];
  category?: ListingCategoryEnum;
  status?: ListingStatusEnum;
  breed?: string;
  location?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'viewCount' | 'favoriteCount';
  sortOrder?: 'ASC' | 'DESC';
  includeExpired?: boolean;
}

async function getAdminListings(params: GetAdminListingsParams = {}): Promise<PaginatedListingsResponseDto> {
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

  const { data } = await axios.get(`/listings/admin/all?${searchParams.toString()}`);
  return data;
}

export const useGetAdminListings = (params: GetAdminListingsParams = {}) => {
  return useQuery({
    queryKey: ['admin-listings', params],
    queryFn: () => getAdminListings(params),
  });
};

