"use client";
import { Routes } from "@/_config/routes";
import { useUser } from "@/_services/hooks/user/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomeLayout({ children }: React.PropsWithChildren) {
  const { data: user, isPending, isError } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !isPending) {
      router.push(Routes.public.home);
    }
  }, [user, isPending, router]);

  // Show loading state while checking user
  if (isPending) {
    return <div>Loading...</div>;
  }

  // Don't render children if user is authenticated
  if (user) {
    return null;
  }

  // If there's an error or no user, render the children (auth forms)
  return children;
}
