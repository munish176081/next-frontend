import { useQuery } from '@tanstack/react-query';
import { wishlistApiService } from '@/_services/wishlist/wishlistApiService';
import { WishlistResponse } from '@/_types/wishlist';

interface UseWishlistItemsParams {
  page?: number;
  limit?: number;
}

export const useWishlistItems = (params: UseWishlistItemsParams = {}) => {
  const { page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ['wishlist-items', { page, limit }],
    queryFn: () => wishlistApiService.getWishlist(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
