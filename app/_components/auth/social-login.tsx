"use client";

import { useState, useEffect } from "react";
import { Button } from "@/_components/ui/button";
import {  FBIcon, GoogleIcon } from "@/_components/icons";
import { API_BASE_URL } from "@/_config/constants";

interface SocialLoginProps {
  type: "signin" | "signup";
}

export default function SocialLogin({ type }: SocialLoginProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  // Reset loading states if the window is closed or if the user navigates away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsGoogleLoading(false);
        setIsFacebookLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    console.log(`${API_BASE_URL}/auth/google`, "FOOFLE");
    const popup = window.open(`${API_BASE_URL}/auth/google`, "_self");

    // Reset loading state if popup is blocked
    if (!popup) {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setIsFacebookLoading(true);
    const popup = window.open(`${API_BASE_URL}/auth/facebook`, "_self");

    // Reset loading state if popup is blocked
    if (!popup) {
      setIsFacebookLoading(false);
    }
  };
  return (
    <>
      <div className="flex gap-4 w-full max-md:flex-col">
        <Button
          unstyled
          type="button"
          onClick={handleGoogleLogin}
          variant="outline"
          isLoading={isGoogleLoading}
          disabled={isGoogleLoading}
          size="xl"
          className="w-full h-16 border border-black font-medium text-lg rounded-full flex items-center justify-center gap-2 max-md:h-12 max-md:mt-0 max-md:text-base disabled:opacity-50"
        >
          <GoogleIcon className="mr-5" />
          {type === "signin" ? "Sign in with Google (test-deploy)" : "Sign up with Google (test-deploy)"}
        </Button>

        <Button
          unstyled
          onClick={handleFacebookLogin}
          isLoading={isFacebookLoading}
          disabled={isFacebookLoading}
          type="button"
          variant="outline"
          size="xl"
          className="w-full h-16 border border-black font-medium text-lg rounded-full flex items-center justify-center gap-2 max-md:h-12 max-md:mt-0 max-md:text-base disabled:opacity-50"
        >
          <FBIcon />
          {type === "signin" ? "Sign in with Facebook" : "Sign up with Facebook"}
        </Button>
      </div>
    </>
  );
}
