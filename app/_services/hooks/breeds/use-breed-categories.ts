import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

export function useBreedCategories() {
  return useQuery({
    queryKey: ['breeds', 'categories'],
    queryFn: async (): Promise<string[]> => {
      const { data } = await axios.get('/breeds/categories');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}