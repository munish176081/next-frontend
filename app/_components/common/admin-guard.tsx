"use client";

import { useUser } from "@/_services/hooks/user/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export const AdminGuard = ({ children, requireSuperAdmin = false }: AdminGuardProps) => {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check if user is logged in
      if (!user) {
        router.push('/auth/sign-in');
        return;
      }

      // Check if user has admin role
      const hasAdminRole = user.role === 'admin' || user.role === 'super_admin';
      const hasSuperAdminRole = user.role === 'super_admin';

      if (!hasAdminRole) {
        router.push('/dashboard');
        return;
      }

      // If super admin is required, check for super admin role
      if (requireSuperAdmin && !hasSuperAdminRole) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, isLoading, router, requireSuperAdmin]);

  // Show minimal loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated or doesn't have proper role, don't render children
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  // If super admin is required but user is not super admin, don't render children
  if (requireSuperAdmin && user.role !== 'super_admin') {
    return null;
  }

  return <>{children}</>;
}; 