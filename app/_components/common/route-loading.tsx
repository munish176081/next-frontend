"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Loader from "../ui/loader/loader";


export default function RouteLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show loading for route changes
    setIsLoading(true);

    // Hide loading after a short delay to allow page to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Loader size="lg" color="primary" />
        <p className="text-sm text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
} 