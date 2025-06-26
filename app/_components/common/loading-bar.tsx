"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset loading state when route changes
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const timer = setTimeout(() => {
      setProgress(30);
    }, 100);

    const timer2 = setTimeout(() => {
      setProgress(60);
    }, 300);

    const timer3 = setTimeout(() => {
      setProgress(90);
    }, 500);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);
    }, 700);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className="h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 