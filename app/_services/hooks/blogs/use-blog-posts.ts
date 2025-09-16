import { useQuery } from '@tanstack/react-query';
import { axios } from '@/_lib/axios';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  authorImage?: string;
  featuredImage: string;
  images?: string[];
  flipImage: boolean;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  viewCount: number;
  likeCount: number;
  shareCount: number;
  isFeatured: boolean;
  isPinned: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  publishedAt?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogPostsQuery {
  search?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  isPinned?: boolean;
  author?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  excludeId?: string;
}

async function fetchBlogPosts(query: BlogPostsQuery = {}): Promise<BlogPostsResponse> {
  const searchParams = new URLSearchParams();
  
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  const { data } = await axios.get(`/blogs?${searchParams.toString()}`);
  return data;
}

async function fetchBlogPostBySlug(slug: string): Promise<BlogPost> {
  const { data } = await axios.get(`/blogs/posts/${slug}`);
  return data;
}

async function fetchFeaturedBlogPosts(limit: number = 6): Promise<BlogPost[]> {
  const { data } = await axios.get(`/blogs/featured?limit=${limit}`);
  return data;
}

async function fetchRecentBlogPosts(limit: number = 6): Promise<BlogPost[]> {
  const { data } = await axios.get(`/blogs/recent?limit=${limit}`);
  return data;
}

async function fetchRelatedBlogPosts(postId: string, limit: number = 4): Promise<BlogPost[]> {
  const { data } = await axios.get(`/blogs/posts/${postId}/related?limit=${limit}`);
  return data;
}

async function searchBlogPosts(searchTerm: string, limit: number = 12): Promise<BlogPost[]> {
  const { data } = await axios.get(`/blogs/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`);
  return data;
}

export const useBlogPosts = (query: BlogPostsQuery = {}) => {
  return useQuery({
    queryKey: ['blog-posts', query],
    queryFn: () => fetchBlogPosts(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useBlogPostBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => fetchBlogPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeaturedBlogPosts = (limit: number = 6) => {
  return useQuery({
    queryKey: ['blog-posts', 'featured', limit],
    queryFn: () => fetchFeaturedBlogPosts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRecentBlogPosts = (limit: number = 6) => {
  return useQuery({
    queryKey: ['blog-posts', 'recent', limit],
    queryFn: () => fetchRecentBlogPosts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRelatedBlogPosts = (postId: string, limit: number = 4) => {
  return useQuery({
    queryKey: ['blog-posts', 'related', postId, limit],
    queryFn: () => fetchRelatedBlogPosts(postId, limit),
    enabled: !!postId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchBlogPosts = (searchTerm: string, limit: number = 12) => {
  return useQuery({
    queryKey: ['blog-posts', 'search', searchTerm, limit],
    queryFn: () => searchBlogPosts(searchTerm, limit),
    enabled: !!searchTerm && searchTerm.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};