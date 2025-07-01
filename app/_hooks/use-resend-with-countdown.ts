"use client";

import { useState, useCallback, useEffect } from "react";
import { parseAxiosError } from "@/_utils/parse-axios-error";

interface UseResendWithCountdownProps {
  onResend: () => Promise<any>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  defaultCooldown?: number; // in seconds
}

export function useResendWithCountdown({
  onResend,
  onSuccess,
  onError,
  defaultCooldown = 60 // 1 minute default
}: UseResendWithCountdownProps) {
  const [isPending, setIsPending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(defaultCooldown); // Start with default cooldown
  const [error, setError] = useState<string | null>(null);

  // Handle countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const extractCooldownFromError = (errorMessage: string): number => {
    // Parse error messages like "Please wait 45 seconds before requesting another verification code"
    const match = errorMessage.match(/(\d+)\s+seconds?/i);
    if (match) {
      return parseInt(match[1]);
    }
    
    // Parse error messages like "Please wait 2 minutes before requesting another verification code"
    const minuteMatch = errorMessage.match(/(\d+)\s+minutes?/i);
    if (minuteMatch) {
      return parseInt(minuteMatch[1]) * 60;
    }
    
    return defaultCooldown;
  };

  const handleResend = useCallback(async () => {
    if (cooldownSeconds > 0) return;
    
    setIsPending(true);
    setError(null);
    
    try {
      await onResend();
      onSuccess?.();
      // Set the default cooldown after successful resend
      setCooldownSeconds(defaultCooldown);
    } catch (err: any) {
      const parsedError = parseAxiosError(err);
      const errorMessage = parsedError?.message || "Something went wrong";
      
      // Check if it's a cooldown error
      if (errorMessage.toLowerCase().includes('wait') && 
          (errorMessage.includes('seconds') || errorMessage.includes('minutes'))) {
        const cooldown = extractCooldownFromError(errorMessage);
        setCooldownSeconds(cooldown);
        setError(`Please wait ${cooldown} seconds before trying again`);
      } else {
        setError(errorMessage);
      }
      
      onError?.(err);
    } finally {
      setIsPending(false);
    }
  }, [onResend, onSuccess, onError, cooldownSeconds, defaultCooldown]);

  const resetCooldown = useCallback(() => {
    setCooldownSeconds(0);
    setError(null);
  }, []);

  return {
    isPending,
    cooldownSeconds,
    error,
    handleResend,
    resetCooldown,
    canResend: cooldownSeconds === 0 && !isPending
  };
} 