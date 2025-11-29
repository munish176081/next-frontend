"use client";

import { useUser } from "@/_services/hooks/user/use-user";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Routes } from "@/_config/routes";

interface RoleBasedRouterProps {
  children: React.ReactNode;
}

export const RoleBasedRouter = ({ children }: RoleBasedRouterProps) => {
  const { data: user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // If user is not authenticated and trying to access protected routes
      if (!user) {
        // Define protected routes that require authentication
        const protectedRoutes = [
          '/dashboard',
          '/account',
          '/admin',
          '/startlisting',
          '/startlistingform'
        ];
        
        // Check if current path is a protected route
        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
        
        if (isProtectedRoute) {
          router.replace('/auth/sign-in');
          return;
        }
        
        // Allow access to public pages
        return;
      }

      // User is authenticated - handle role-based routing
      const userRole = user.role || 'user';
      const isAdmin = userRole === 'super_admin' || userRole === 'admin';
      
      // Redirect authenticated users away from auth pages that are not needed when logged in
      if (pathname.startsWith('/auth/sign-in') || 
          pathname.startsWith('/auth/sign-up') ||
          pathname.startsWith('/auth/forgot-password') ||
          pathname.startsWith('/auth/reset-password') ||
          pathname.startsWith('/auth/sign-in-error')) {
        router.replace('/dashboard');
        return;
      }
      
      // Skip routing logic for public pages
      if (
        pathname === '/' || 
        pathname.startsWith('/explore') || 
        pathname.startsWith('/wishlist') || 
        pathname.startsWith('/meetings') || 
        pathname.startsWith('/contact') || 
        pathname.startsWith('/blog') || 
        pathname.startsWith('/create-listing') ||
        pathname.startsWith('/chat') || 
        pathname.startsWith('/user') ||
        // Treat content pages (privacy, terms, FAQ, shipping, partners, etc.) as public
        pathname.startsWith('/content')
      ) {
        return;
      }

      // Handle admin routes
      if (pathname.startsWith('/admin')) {
        // If user is not admin, redirect to dashboard
        if (!isAdmin) {
          router.replace('/dashboard');
          return;
        }
        // If user is admin and on admin route, allow access
        return;
      }

      // Handle startlisting routes - allow all authenticated users
      if (pathname.startsWith('/startlisting') || pathname.startsWith('/startlistingform')) {
        return;
      }

      // Handle user routes and dashboard - allow all authenticated users
      if (pathname.startsWith('/account') || pathname === '/dashboard') {
        return;
      }

      // For any other authenticated route, redirect to dashboard
      router.replace('/dashboard');
    }
  }, [user, isLoading, router, pathname]);

  // Show minimal loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}; 