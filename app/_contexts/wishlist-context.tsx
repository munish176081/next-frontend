'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { WishlistState, WishlistItem } from '@/_types/wishlist';
import { wishlistApiService } from '@/_services/wishlist/wishlistApiService';
import { toast } from '@/_hooks/use-toast';

// Action types
type WishlistAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_FILTER_ACTIVE'; payload: boolean }
  | { type: 'SET_WISHLIST_ITEMS'; payload: Set<string> }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'SET_PAGINATION'; payload: Partial<WishlistState['pagination']> }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Initial state
const initialState: WishlistState = {
  wishlistedItems: new Set(),
  isLoading: false,
  isOffline: false,
  filterActive: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  error: null,
};

// Reducer
function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'SET_FILTER_ACTIVE':
      return { ...state, filterActive: action.payload };
    case 'SET_WISHLIST_ITEMS':
      return { ...state, wishlistedItems: action.payload };
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        wishlistedItems: new Set([...state.wishlistedItems, action.payload]),
      };
    case 'REMOVE_FROM_WISHLIST':
      const newSet = new Set(state.wishlistedItems);
      newSet.delete(action.payload);
      return { ...state, wishlistedItems: newSet };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
const WishlistContext = createContext<{
  state: WishlistState;
  addToWishlist: (listingId: string) => Promise<void>;
  removeFromWishlist: (listingId: string) => Promise<void>;
  toggleWishlist: (listingId: string) => Promise<void>;
  isWishlisted: (listingId: string) => boolean;
  loadWishlistStatus: (listingIds: string[]) => Promise<void>;
  loadWishlist: (page?: number) => Promise<WishlistItem[]>;
  toggleFilter: () => void;
  syncWithServer: () => Promise<void>;
} | null>(null);

// Provider component
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // Check online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_OFFLINE', payload: false });
      syncWithServer();
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_OFFLINE', payload: true });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    dispatch({ type: 'SET_OFFLINE', payload: !navigator.onLine });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load wishlist status for multiple listings
  const loadWishlistStatus = useCallback(async (listingIds: string[]) => {
    if (listingIds.length === 0) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const statuses = await wishlistApiService.getWishlistStatus(listingIds);
      const wishlistedIds = new Set(
        statuses.filter(status => status.isWishlisted).map(status => status.listingId)
      );
      dispatch({ type: 'SET_WISHLIST_ITEMS', payload: wishlistedIds });
    } catch (error) {
      console.error('Failed to load wishlist status:', error);
      // Try to load from localStorage as fallback
      loadFromLocalStorage();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Load wishlist with pagination
  const loadWishlist = useCallback(async (page: number = 1): Promise<WishlistItem[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await wishlistApiService.getWishlist(page, state.pagination.limit);
      
      dispatch({
        type: 'SET_PAGINATION',
        payload: {
          page: response.page,
          total: response.total,
          hasMore: response.hasMore,
        },
      });

      return response.items;
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.pagination.limit]);

  // Add to wishlist
  const addToWishlist = useCallback(async (listingId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (state.isOffline) {
        // Store in localStorage for later sync
        addToLocalStorage(listingId);
        dispatch({ type: 'ADD_TO_WISHLIST', payload: listingId });
        toast({
          title: "Added to wishlist",
          description: "Will sync when online",
        });
        return;
      }

      await wishlistApiService.addToWishlist(listingId);
      dispatch({ type: 'ADD_TO_WISHLIST', payload: listingId });
      saveToLocalStorage();
      
      toast({
        title: "Added to wishlist",
        description: "Item added successfully",
      });
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      
      // Revert the optimistic update
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: listingId });
      
      let errorMessage = "Failed to add to wishlist";
      let errorTitle = "Error";
      let showToast = true;
      
      if (error instanceof Error) {
        if (error.message.includes('authenticated') || error.message.includes('login')) {
          errorTitle = "Please login";
          errorMessage = "Please login to add items to wishlist";
        } else if (error.message.includes('own listing') || error.message.includes('Cannot add your own listing')) {
          errorTitle = "Cannot wishlist";
          errorMessage = "You cannot add your own listing to wishlist";
          showToast = false; // Don't show toast for own listing error
        } else if (error.message.includes('already in wishlist')) {
          errorTitle = "Already in wishlist";
          errorMessage = "This item is already in your wishlist";
        } else {
          // Use the actual backend error message
          errorMessage = error.message;
        }
      }
      
      if (showToast) {
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.isOffline]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (listingId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (state.isOffline) {
        // Remove from localStorage
        removeFromLocalStorage(listingId);
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: listingId });
        toast({
          title: "Removed from wishlist",
          description: "Will sync when online",
        });
        return;
      }

      await wishlistApiService.removeFromWishlist(listingId);
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: listingId });
      saveToLocalStorage();
      
      toast({
        title: "Removed from wishlist",
        description: "Item removed successfully",
      });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      // Revert the optimistic update
      dispatch({ type: 'ADD_TO_WISHLIST', payload: listingId });
      
      let errorMessage = "Failed to remove from wishlist";
      let errorTitle = "Error";
      
      if (error instanceof Error) {
        if (error.message.includes('authenticated') || error.message.includes('login')) {
          errorTitle = "Please login";
          errorMessage = "Please login to remove items from wishlist";
        } else if (error.message.includes('not found in wishlist')) {
          errorTitle = "Not in wishlist";
          errorMessage = "This item is not in your wishlist";
        } else {
          // Use the actual backend error message
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.isOffline]);

  // Toggle wishlist
  const toggleWishlist = useCallback(async (listingId: string) => {
    if (state.wishlistedItems.has(listingId)) {
      await removeFromWishlist(listingId);
    } else {
      await addToWishlist(listingId);
    }
  }, [state.wishlistedItems, addToWishlist, removeFromWishlist]);

  // Check if item is wishlisted
  const isWishlisted = useCallback((listingId: string) => {
    return state.wishlistedItems.has(listingId);
  }, [state.wishlistedItems]);

  // Toggle filter
  const toggleFilter = useCallback(() => {
    dispatch({ type: 'SET_FILTER_ACTIVE', payload: !state.filterActive });
  }, [state.filterActive]);

  // Sync with server
  const syncWithServer = useCallback(async () => {
    if (state.isOffline) return;

    try {
      const localWishlist = getFromLocalStorage();
      if (localWishlist.length === 0) return;

      // Sync each item
      for (const listingId of localWishlist) {
        try {
          await wishlistApiService.addToWishlist(listingId);
        } catch (error) {
          console.error(`Failed to sync ${listingId}:`, error);
        }
      }

      // Clear localStorage after successful sync
      clearLocalStorage();
      toast({
        title: "Synced",
        description: "Wishlist synced with server",
      });
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    }
  }, [state.isOffline]);

  // Load from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const wishlistIds = JSON.parse(stored);
        dispatch({ type: 'SET_WISHLIST_ITEMS', payload: new Set(wishlistIds) });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      const wishlistIds = Array.from(state.wishlistedItems);
      localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [state.wishlistedItems]);

  // Add to localStorage
  const addToLocalStorage = useCallback((listingId: string) => {
    try {
      const stored = localStorage.getItem('wishlist');
      const wishlistIds = stored ? JSON.parse(stored) : [];
      if (!wishlistIds.includes(listingId)) {
        wishlistIds.push(listingId);
        localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
      }
    } catch (error) {
      console.error('Failed to add to localStorage:', error);
    }
  }, []);

  // Remove from localStorage
  const removeFromLocalStorage = useCallback((listingId: string) => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const wishlistIds = JSON.parse(stored).filter((id: string) => id !== listingId);
        localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
      }
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }, []);

  // Get from localStorage
  const getFromLocalStorage = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return [];
    }
  }, []);

  // Clear localStorage
  const clearLocalStorage = useCallback(() => {
    try {
      localStorage.removeItem('wishlist');
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const value = {
    state,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
    loadWishlistStatus,
    loadWishlist,
    toggleFilter,
    syncWithServer,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// Hook to use wishlist context
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
