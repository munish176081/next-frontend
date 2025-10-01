import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

export interface HomepageBreed {
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

export interface HomepageBreedTypeImage {
  id: string;
  category: string;
  imageUrl: string;
  title?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Get featured breeds for homepage
export function useHomepageBreeds() {
  return useQuery({
    queryKey: ['homepage', 'breeds'],
    queryFn: async (): Promise<HomepageBreed[]> => {
      const { data } = await axios.get('/breeds/homepage/featured');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get featured breed type images for homepage
export function useHomepageBreedTypeImages() {
  return useQuery({
    queryKey: ['homepage', 'breed-type-images'],
    queryFn: async (): Promise<HomepageBreedTypeImage[]> => {
      const { data } = await axios.get('/breed-type-images/homepage/featured');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
