import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { ListingResponseDto } from '@/_types/listing';

async function getListingById(id: string): Promise<ListingResponseDto> {
  const { data } = await axios.get(`/users/listings/${id}`);
  return data;
}

export const useGetListingById = (id: string | null) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingById(id!),
    enabled: !!id,
  });
}; 