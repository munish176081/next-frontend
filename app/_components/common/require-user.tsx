"use client";

import { VerifyEmailForm } from "@/(pages)/auth/verify-email/_components/verify-email-form";
import { VerifyEmailPage } from "@/(pages)/auth/verify-email/_components/verify-email-page";
import { useUser } from "@/_services/hooks/user/use-user";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export const RequireUser = ({
  children,
  className,
  successRedirect,
  shouldVerified = true,
}: {
  children: React.ReactNode;
  className?: string;
  successRedirect?: string;
  shouldVerified?: boolean;
}) => {
  const { data: user, isPending, isError } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && (!user || isError)) {
      // Redirect to sign-in with redirect param
      // router.replace(`/auth/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isPending, isError, router, pathname]);

  // Show loading state while checking user
  if (isPending) {
    return <div>Loading...</div>;
  }

  // If user needs to be verified and isn't active, show verify email form
  if (shouldVerified && user && user.status !== "active") {
    return <VerifyEmailPage noshow={true} />;
  }

  // User is authenticated and verified, render children
  return <>{children}</>;
};
