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
    onMutate: async (breedId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'breeds'] });
      await queryClient.cancelQueries({ queryKey: ['breeds'] });
      await queryClient.cancelQueries({ queryKey: ['breeds', 'featured'] });
      await queryClient.cancelQueries({ queryKey: ['homepage', 'breeds'] });

      // Snapshot the previous value
      const previousBreeds = queryClient.getQueryData(['admin', 'breeds']);

      // Optimistically update the cache
      queryClient.setQueryData(['admin', 'breeds'], (old: any) => {
        if (!old?.breeds) return old;
        return {
          ...old,
          breeds: old.breeds.map((breed: any) =>
            breed.id === breedId
              ? { ...breed, isFeatured: !breed.isFeatured }
              : breed
          ),
        };
      });

      return { previousBreeds };
    },
    onSuccess: (data) => {
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['breeds'] });
      queryClient.invalidateQueries({ queryKey: ['breeds', 'featured'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'breeds'] });
      queryClient.invalidateQueries({ queryKey: ['homepage', 'breeds'] });
      
      toast({
        title: "Success",
        description: `Breed ${data.isFeatured ? 'featured' : 'unfeatured'} successfully!`,
      });
    },
    onError: (error: any, breedId: string, context: any) => {
      // Revert optimistic update on error
      if (context?.previousBreeds) {
        queryClient.setQueryData(['admin', 'breeds'], context.previousBreeds);
      }
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update breed status",
        variant: "destructive",
      });
    },
  });
};
