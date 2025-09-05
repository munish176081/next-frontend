export interface WishlistItem {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    price: number;
    breed: string;
    location: string;
    imageUrl?: string;
  };
}

export interface WishlistResponse {
  items: WishlistItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface WishlistStatus {
  listingId: string;
  isWishlisted: boolean;
}

export interface AddToWishlistRequest {
  listingId: string;
}

export interface WishlistState {
  wishlistedItems: Set<string>;
  isLoading: boolean;
  isOffline: boolean;
  filterActive: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error: string | null;
}
