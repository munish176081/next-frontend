import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

interface CreateCategoryData {
  category: string;
}

interface CreateCategoryResponse {
  success: boolean;
  message: string;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData): Promise<CreateCategoryResponse> => {
      const response = await axios.post('/breed-type-images/admin/categories', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['admin', 'available-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breed-type-images'] });
      
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create category",
        variant: "destructive",
      });
    },
  });
}
