import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';
import { toast } from '@/_hooks/use-toast';

export const useToggleFeaturedBreed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (breedId: string) => {
      const response = await axios.patch(`/breeds/${breedId}/toggle-featured`);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch breeds queries
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
      queryClient.invalidateQueries({ queryKey: ['breeds', 'featured'] });
      
      toast({
        title: "Success",
        description: `Breed ${data.isFeatured ? 'featured' : 'unfeatured'} successfully!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update breed status",
        variant: "destructive",
      });
    },
  });
};
