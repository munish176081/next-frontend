import { useState, useEffect } from 'react';

/**
 * Utility functions to handle image loading with ORB (Opaque Response Blocking) fallbacks
 */

export interface ImageLoadResult {
  success: boolean;
  url: string;
  error?: string;
  fallbackUrl?: string;
}

/**
 * Attempts to load an image with fallback strategies for ORB-blocked images
 */
export const loadImageWithFallback = async (url: string): Promise<ImageLoadResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ success: true, url });
    };
    
    img.onerror = () => {
      console.warn('Image failed to load, trying fallback strategies:', url);
      
      // Try different fallback strategies
      const fallbackUrl = generateFallbackUrl(url);
      
      if (fallbackUrl) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          resolve({ success: true, url: fallbackUrl, fallbackUrl });
        };
        fallbackImg.onerror = () => {
          resolve({ success: false, url, error: 'ORB blocked and fallback failed' });
        };
        fallbackImg.src = fallbackUrl;
      } else {
        resolve({ success: false, url, error: 'ORB blocked' });
      }
    };
    
    img.src = url;
  });
};

/**
 * Generates fallback URLs for ORB-blocked images
 */
export const generateFallbackUrl = (originalUrl: string): string | null => {
  try {
    const url = new URL(originalUrl);
    
    // Strategy 1: Add cache-busting parameter
    url.searchParams.set('cb', Date.now().toString());
    
    // Strategy 2: Use a different protocol if available
    if (url.protocol === 'https:') {
      // Try HTTP if HTTPS fails (though this is less secure)
      // url.protocol = 'http:';
    }
    
    return url.toString();
  } catch (error) {
    console.error('Error generating fallback URL:', error);
    return null;
  }
};

/**
 * Checks if an image URL is likely to be blocked by ORB
 */
export const isLikelyORBBlocked = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // ORB typically blocks cross-origin requests without proper CORS headers
    // This is a heuristic check - not 100% accurate
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const isCrossOrigin = urlObj.origin !== currentOrigin;
    
    // CDN URLs are more likely to have ORB issues
    const isCDN = url.includes('cdn.') || url.includes('cloudfront.') || url.includes('r2.cloudflarestorage.com');
    
    return isCrossOrigin && isCDN;
  } catch (error) {
    return false;
  }
};

/**
 * Creates a data URL from an image URL (for small images)
 * Note: This requires the image to be accessible via fetch
 */
export const createDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('Failed to create data URL:', error);
    return null;
  }
};

/**
 * Component-friendly image loader hook
 */
export const useImageLoader = (url: string) => {
  const [state, setState] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    fallbackUrl: string | null;
  }>({
    loading: true,
    success: false,
    error: null,
    fallbackUrl: null
  });

  useEffect(() => {
    if (!url) {
      setState({ loading: false, success: false, error: 'No URL provided', fallbackUrl: null });
      return;
    }

    setState({ loading: true, success: false, error: null, fallbackUrl: null });

    loadImageWithFallback(url)
      .then((result) => {
        setState({
          loading: false,
          success: result.success,
          error: result.error || null,
          fallbackUrl: result.fallbackUrl || null
        });
      })
      .catch((error) => {
        setState({
          loading: false,
          success: false,
          error: error.message,
          fallbackUrl: null
        });
      });
  }, [url]);

  return state;
};
