import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const { data } = await axios.get('/blogs/categories');
  return data;
}

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: fetchBlogCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
