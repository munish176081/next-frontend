import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

export const useFeaturedBreeds = () => {
  return useQuery({
    queryKey: ['breeds', 'featured'],
    queryFn: async () => {
      const response = await axios.get('/breeds/featured');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
