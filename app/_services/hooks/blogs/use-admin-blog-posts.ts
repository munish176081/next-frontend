import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { BlogPost } from './use-blog-posts';

// Admin Blog Post Hooks
export const useAdminBlogPosts = (query: any = {}) => {
  return useQuery({
    queryKey: ['admin-blog-posts', query],
    queryFn: async () => {
      const { data } = await axios.get('/blogs', { params: query });
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postData: any) => {
      const { data } = await axios.post('/blogs/posts', postData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};

export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const { data } = await axios.put(`/blogs/posts/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/blogs/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
};

export const useAdminBlogCategories = () => {
  return useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: async () => {
      const { data } = await axios.get('/blogs/categories');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categoryData: any) => {
      const { data } = await axios.post('/blogs/categories', categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
};

export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const { data } = await axios.put(`/blogs/categories/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
};

export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/blogs/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] });
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
};
