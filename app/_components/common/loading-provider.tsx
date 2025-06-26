"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Loader from "../ui/loader/loader";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const showLoading = () => {
    setIsLoading(true);
    setProgress(0);
  };

  const hideLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);
  };

  // Auto-loading for route changes
  useEffect(() => {
    showLoading();

    // Simulate progress
    const timers = [
      setTimeout(() => setProgress(20), 100),
      setTimeout(() => setProgress(40), 200),
      setTimeout(() => setProgress(60), 300),
      setTimeout(() => setProgress(80), 400),
      setTimeout(() => setProgress(95), 500),
      setTimeout(() => hideLoading(), 600),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pathname, searchParams]);

  const value = {
    isLoading,
    setIsLoading,
    showLoading,
    hideLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <>
          {/* Progress bar at top */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <div
              className="h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Loading overlay */}
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4 bg-white rounded-lg p-8 shadow-lg">
              <Loader size="xl" color="primary" />
              <p className="text-sm text-gray-600 font-medium">Loading...</p>
            </div>
          </div>
        </>
      )}
    </LoadingContext.Provider>
  );
} 