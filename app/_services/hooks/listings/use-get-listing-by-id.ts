import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingResponseDto } from '@/_types/listing';

async function getListingById(id: string): Promise<ListingResponseDto> {
  const { data } = await axios.get(`/listings/${id}`);
  return data;
}

export const useGetListingById = (id: string | null) => {
  return useQuery({
    queryKey: ['current-user-listing', id], // Match the query key used by other components
    queryFn: () => getListingById(id!),
    enabled: !!id,
  });
}; 