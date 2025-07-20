import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

async function favoriteListing(id: string) {
  await axios.post(`/listings/${id}/favorite`);
}

async function unfavoriteListing(id: string) {
  await axios.delete(`/listings/${id}/favorite`);
}

export const useFavoriteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: favoriteListing,
    onSuccess: () => {
      // Invalidate listings queries to refresh favorite counts
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['search-listings'] });
      queryClient.invalidateQueries({ queryKey: ['featured-listings'] });
      queryClient.invalidateQueries({ queryKey: ['premium-listings'] });
    },
  });
};

export const useUnfavoriteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfavoriteListing,
    onSuccess: () => {
      // Invalidate listings queries to refresh favorite counts
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['search-listings'] });
      queryClient.invalidateQueries({ queryKey: ['featured-listings'] });
      queryClient.invalidateQueries({ queryKey: ['premium-listings'] });
    },
  });
}; 