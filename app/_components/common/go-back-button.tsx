"use client";

import { useRouter } from "next/navigation";
import { Routes } from "@/_config/routes";

interface GoBackButtonProps {
  fallbackRoute?: string;
  className?: string;
}

export default function GoBackButton({ 
  fallbackRoute = Routes.public.home, 
  className = "" 
}: GoBackButtonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    // Check if there's a previous page in the browser history
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no previous page, navigate to fallback route
      router.push(fallbackRoute);
    }
  };

  return (
    <button
      onClick={handleGoBack}
      className={`flex items-center bg-[#F3F3F3] p-0.5 rounded-full pr-2 gap-1 font-medium text-xs cursor-pointer hover:bg-[#E5E5E5] transition-colors ${className}`}
    >
      <span className="flex size-6 bg-black rounded-full items-center justify-center">
        <img src="/images/vectors/arrowLeftWhite.svg" alt="Go back" />
      </span>
      Go Back
    </button>
  );
} 