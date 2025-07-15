"use client";

import { useUser } from "@/_services/hooks/user/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Routes } from "@/_config/routes";
import { VerifyEmailPage } from "@/(pages)/auth/verify-email/_components/verify-email-page";

interface VerificationGuardProps {
  children: React.ReactNode;
}

export const VerificationGuard = ({ children }: VerificationGuardProps) => {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;
  }, [user, isLoading, router]);

  // Show loading while checking user status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is not verified, show the VerifyEmailPage component in full screen
  if (user && user.status !== "active") {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <VerifyEmailPage noshow={true} />
      </div>
    );
  }

  // If user is verified, render children
  return <>{children}</>;
}; 