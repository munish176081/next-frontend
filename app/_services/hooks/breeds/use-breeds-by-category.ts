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
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export function useBreedsByCategory(category: string) {
  return useQuery({
    queryKey: ['breeds', 'category', category],
    queryFn: async (): Promise<Breed[]> => {
      if (!category) return [];
      const { data } = await axios.get(`/breeds/category/${encodeURIComponent(category)}`);
      return data;
    },
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
