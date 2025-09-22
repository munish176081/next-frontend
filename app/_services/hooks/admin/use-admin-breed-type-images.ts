import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

export interface BreedTypeImage {
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

export interface CreateBreedTypeImageData {
  category: string;
  imageUrl: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateBreedTypeImageData extends Partial<CreateBreedTypeImageData> {}

export interface AvailableCategory {
  category: string;
  hasImage: boolean;
  imageId?: string;
}

export interface CreateCategoryImageData {
  imageUrl: string;
  title?: string;
  description?: string;
}

// Get all breed type images
export function useAdminBreedTypeImages() {
  return useQuery({
    queryKey: ['admin', 'breed-type-images'],
    queryFn: async (): Promise<BreedTypeImage[]> => {
      const { data } = await axios.get('/breed-type-images/admin');
      return data;
    },
  });
}

// Get active breed type images
export function useAdminActiveBreedTypeImages() {
  return useQuery({
    queryKey: ['admin', 'breed-type-images', 'active'],
    queryFn: async (): Promise<BreedTypeImage[]> => {
      const { data } = await axios.get('/breed-type-images/admin/active');
      return data;
    },
  });
}

// Get single breed type image
export function useAdminBreedTypeImage(id: string) {
  return useQuery({
    queryKey: ['admin', 'breed-type-images', id],
    queryFn: async (): Promise<BreedTypeImage> => {
      const { data } = await axios.get(`/breed-type-images/admin/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create breed type image
export function useCreateBreedTypeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBreedTypeImageData): Promise<BreedTypeImage> => {
      const { data: response } = await axios.post('/breed-type-images/admin', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images'] });
      toast({
        title: 'Success',
        description: 'Breed type image created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create breed type image',
        variant: 'destructive',
      });
    },
  });
}

// Update breed type image
export function useUpdateBreedTypeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBreedTypeImageData }): Promise<BreedTypeImage> => {
      const { data: response } = await axios.patch(`/breed-type-images/admin/${id}`, data);
      return response;
    },
    onSuccess: (updatedBreedTypeImage) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images', updatedBreedTypeImage.id] });
      toast({
        title: 'Success',
        description: 'Breed type image updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update breed type image',
        variant: 'destructive',
      });
    },
  });
}

// Delete breed type image
export function useDeleteBreedTypeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`/breed-type-images/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images'] });
      toast({
        title: 'Success',
        description: 'Breed type image deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete breed type image',
        variant: 'destructive',
      });
    },
  });
}

// Toggle breed type image status
export function useToggleBreedTypeImageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<BreedTypeImage> => {
      const { data } = await axios.patch(`/breed-type-images/admin/${id}/toggle-status`);
      return data;
    },
    onSuccess: (updatedBreedTypeImage) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images', updatedBreedTypeImage.id] });
      toast({
        title: 'Success',
        description: `Breed type image ${updatedBreedTypeImage.isActive ? 'activated' : 'deactivated'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle breed type image status',
        variant: 'destructive',
      });
    },
  });
}

// Get available categories for images
export function useAvailableCategories() {
  return useQuery({
    queryKey: ['admin', 'breed-type-images', 'available-categories'],
    queryFn: async (): Promise<AvailableCategory[]> => {
      const { data } = await axios.get('/breed-type-images/admin/categories/available');
      return data;
    },
  });
}

// Get unique categories from breeds
export function useUniqueCategories() {
  return useQuery({
    queryKey: ['admin', 'breed-type-images', 'unique-categories'],
    queryFn: async (): Promise<string[]> => {
      const { data } = await axios.get('/breed-type-images/admin/categories/unique');
      return data;
    },
  });
}

// Create image for category
export function useCreateCategoryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ category, data }: { category: string; data: CreateCategoryImageData }): Promise<BreedTypeImage> => {
      const { data: response } = await axios.post(`/breed-type-images/admin/category/${category}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images', 'available-categories'] });
      toast({
        title: 'Success',
        description: 'Category image created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create category image',
        variant: 'destructive',
      });
    },
  });
}
