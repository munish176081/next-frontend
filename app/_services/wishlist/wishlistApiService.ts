import { WishlistItem, WishlistResponse, WishlistStatus, AddToWishlistRequest } from '@/_types/wishlist';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://10.20.20.188:3001') + '/api/v1';

class WishlistApiService {
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      credentials: 'include',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      try {
        const errorData = await response.json();
        // Try to extract meaningful error message from backend
        const errorMessage = errorData.message || 
                           errorData.error?.message || 
                           errorData.error || 
                           `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      } catch (parseError) {
        // If JSON parsing fails, throw a generic error
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }
    return response.json();
  }

  // Add item to wishlist
  async addToWishlist(listingId: string): Promise<WishlistItem> {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ listingId }),
    });

    return this.handleResponse<WishlistItem>(response);
  }

  // Remove item from wishlist
  async removeFromWishlist(listingId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${listingId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<void>(response);
  }

  // Get user's wishlist with pagination
  async getWishlist(page: number = 1, limit: number = 20): Promise<WishlistResponse> {
    const response = await fetch(`${API_BASE_URL}/wishlist?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<WishlistResponse>(response);
  }

  // Get wishlist status for multiple listings
  async getWishlistStatus(listingIds: string[]): Promise<WishlistStatus[]> {
    if (listingIds.length === 0) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/wishlist/status?listingIds=${listingIds.join(',')}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<WishlistStatus[]>(response);
  }

  // Check if single listing is wishlisted
  async checkWishlistStatus(listingId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/wishlist/check/${listingId}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });

    const result = await this.handleResponse<{ isWishlisted: boolean }>(response);
    return result.isWishlisted;
  }
}

export const wishlistApiService = new WishlistApiService();
