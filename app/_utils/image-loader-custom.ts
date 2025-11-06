/**
 * Custom image loader for Next.js Image component
 * Proxies images through the backend to avoid 403 errors
 */

export default function customImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // If it's already a relative path or data URL, return as is
  if (src.startsWith('/') && !src.startsWith('/api/')) {
    return src;
  }
  
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // Check if the image is from pups4sale.com.au domains that might need proxying
  // Proxy client images and CDN images to avoid 403 errors
  const needsProxy = 
    (src.includes('pups4sale.com.au') && src.includes('/images/clients/')) ||
    src.includes('cdn.pups4sale.com.au');

  if (needsProxy) {
    // Get the base URL (works in both server and client contexts)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000');
    
    // Proxy through Next.js API route which then proxies through backend
    const apiUrl = `${baseUrl}/api/proxy-image?url=${encodeURIComponent(src)}`;
    return apiUrl;
  }

  // For other images, return as is (Next.js will handle optimization if needed)
  return src;
}

