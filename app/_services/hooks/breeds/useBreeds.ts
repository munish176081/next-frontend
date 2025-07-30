import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

export interface Breed {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  size?: string;
  temperament?: string;
  lifeExpectancy?: string;
  isActive: boolean;
  sortOrder: number;
}

export function useBreeds() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Breed[]>({
    queryKey: ['breeds', 'active'],
    queryFn: async () => {
      const res = await axios.get('/breeds/active');
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    breeds: data || [],
    isLoading,
    isError,
    error,
    refetch,
  };
} 