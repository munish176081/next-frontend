import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

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
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBreedData {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  size?: string;
  temperament?: string;
  lifeExpectancy?: string;
  isActive?: boolean;
  sortOrder?: number;
  imageUrl?: string;
}

export interface UpdateBreedData extends Partial<CreateBreedData> {}

export interface BreedQueryParams {
  search?: string;
  category?: string;
  size?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BreedsResponse {
  breeds: Breed[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get all breeds with filtering and pagination
export function useAdminBreeds(params: BreedQueryParams = {}) {
  return useQuery<BreedsResponse>({
    queryKey: ['admin', 'breeds', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
      
      const res = await axios.get(`/breeds?${searchParams.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get a single breed by ID
export function useAdminBreed(id: string) {
  return useQuery<Breed>({
    queryKey: ['admin', 'breeds', id],
    queryFn: async () => {
      const res = await axios.get(`/breeds/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get active breeds (for dropdowns)
export function useAdminActiveBreeds() {
  return useQuery<Breed[]>({
    queryKey: ['admin', 'breeds', 'active'],
    queryFn: async () => {
      const res = await axios.get('/breeds/active');
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Search breeds
export function useAdminSearchBreeds(searchTerm: string) {
  return useQuery<Breed[]>({
    queryKey: ['admin', 'breeds', 'search', searchTerm],
    queryFn: async () => {
      const res = await axios.get(`/breeds/search?q=${encodeURIComponent(searchTerm)}`);
      return res.data;
    },
    enabled: !!searchTerm && searchTerm.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create breed mutation
export function useCreateBreed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateBreedData) => {
      const res = await axios.post('/breeds', data);
      return res.data;
    },
    onSuccess: (newBreed) => {
      toast({
        title: 'Breed Created',
        description: `Successfully created breed: ${newBreed.name}`,
      });
      
      // Invalidate and refetch breeds lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds'] });
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Create Failed',
        description: error.response?.data?.message || 'Failed to create breed',
        variant: 'destructive',
      });
    },
  });
}

// Update breed mutation
export function useUpdateBreed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBreedData }) => {
      const res = await axios.patch(`/breeds/${id}`, data);
      return res.data;
    },
    onSuccess: (updatedBreed) => {
      toast({
        title: 'Breed Updated',
        description: `Successfully updated breed: ${updatedBreed.name}`,
      });
      
      // Invalidate and refetch breeds lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds'] });
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds', updatedBreed.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.message || 'Failed to update breed',
        variant: 'destructive',
      });
    },
  });
}

// Delete breed mutation (soft delete)
export function useDeleteBreed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/breeds/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      toast({
        title: 'Breed Deleted',
        description: 'Breed has been deactivated successfully',
      });
      
      // Invalidate and refetch breeds lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds'] });
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.response?.data?.message || 'Failed to delete breed',
        variant: 'destructive',
      });
    },
  });
}

// Hard delete breed mutation
export function useHardDeleteBreed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/breeds/${id}/hard`);
      return id;
    },
    onSuccess: (deletedId) => {
      toast({
        title: 'Breed Permanently Deleted',
        description: 'Breed has been permanently removed from the system',
      });
      
      // Invalidate and refetch breeds lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds'] });
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Hard Delete Failed',
        description: error.response?.data?.message || 'Failed to permanently delete breed',
        variant: 'destructive',
      });
    },
  });
}

// Toggle breed active status
export function useToggleBreedStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await axios.patch(`/breeds/${id}`, { isActive });
      return res.data;
    },
    onSuccess: (updatedBreed) => {
      const status = updatedBreed.isActive ? 'activated' : 'deactivated';
      toast({
        title: 'Breed Status Updated',
        description: `Successfully ${status} breed: ${updatedBreed.name}`,
      });
      
      // Invalidate and refetch breeds lists
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds'] });
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds', updatedBreed.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Status Update Failed',
        description: error.response?.data?.message || 'Failed to update breed status',
        variant: 'destructive',
      });
    },
  });
} 