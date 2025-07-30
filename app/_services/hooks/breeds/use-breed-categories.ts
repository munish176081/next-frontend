import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

async function getBreedCategories(): Promise<string[]> {
  const { data } = await axios.get('/breeds/categories');
  return data;
}

export const useBreedCategories = () => {
  return useQuery({
    queryKey: ['breed-categories'],
    queryFn: getBreedCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}; 