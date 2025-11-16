"use client";

import { useState, useCallback, useEffect } from "react";
import { parseAxiosError } from "@/_utils/parse-axios-error";

interface UseResendWithCountdownProps {
  onResend: () => Promise<any>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  defaultCooldown?: number; // in seconds
  storageKey?: string; // Optional key for localStorage persistence
}

export function useResendWithCountdown({
  onResend,
  onSuccess,
  onError,
  defaultCooldown = 60, // 1 minute default
  storageKey
}: UseResendWithCountdownProps) {
  // Initialize cooldown from localStorage if available
  const getInitialCooldown = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') {
      return 0; // Start with 0 if no storage key or SSR
    }
    
    try {
      const storedTimestamp = localStorage.getItem(storageKey);
      if (storedTimestamp) {
        const endTime = parseInt(storedTimestamp, 10);
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        // If cooldown expired, clear storage
        if (remaining <= 0) {
          localStorage.removeItem(storageKey);
          return 0;
        }
        
        return remaining;
      }
    } catch (error) {
      console.warn('Failed to read cooldown from localStorage:', error);
    }
    
    return 0;
  }, [storageKey]);

  const [isPending, setIsPending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(getInitialCooldown);
  const [error, setError] = useState<string | null>(null);

  // Restore cooldown from localStorage on mount
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      const initialCooldown = getInitialCooldown();
      if (initialCooldown > 0) {
        setCooldownSeconds(initialCooldown);
      }
    }
  }, [storageKey, getInitialCooldown]);

  // Store cooldown end timestamp in localStorage when cooldown is set
  const storeCooldownTimestamp = useCallback((seconds: number) => {
    if (!storageKey || typeof window === 'undefined' || seconds <= 0) {
      return;
    }
    
    try {
      const endTime = Date.now() + (seconds * 1000);
      localStorage.setItem(storageKey, endTime.toString());
    } catch (error) {
      console.warn('Failed to store cooldown in localStorage:', error);
    }
  }, [storageKey]);

  // Clear cooldown from localStorage
  const clearStoredCooldown = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear cooldown from localStorage:', error);
    }
  }, [storageKey]);

  // Handle countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      // Clear storage when cooldown completes
      clearStoredCooldown();
      return;
    }

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearStoredCooldown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds, clearStoredCooldown]);

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
      storeCooldownTimestamp(defaultCooldown);
    } catch (err: any) {
      const parsedError = parseAxiosError(err);
      const errorMessage = parsedError?.message || "Something went wrong";
      
      // Check if it's a cooldown error
      if (errorMessage.toLowerCase().includes('wait') && 
          (errorMessage.includes('seconds') || errorMessage.includes('minutes'))) {
        const cooldown = extractCooldownFromError(errorMessage);
        setCooldownSeconds(cooldown);
        storeCooldownTimestamp(cooldown);
        setError(`Please wait ${cooldown} seconds before trying again`);
      } else {
        setError(errorMessage);
      }
      
      onError?.(err);
    } finally {
      setIsPending(false);
    }
  }, [onResend, onSuccess, onError, cooldownSeconds, defaultCooldown, storeCooldownTimestamp]);

  const resetCooldown = useCallback(() => {
    setCooldownSeconds(0);
    setError(null);
    clearStoredCooldown();
  }, [clearStoredCooldown]);

  return {
    isPending,
    cooldownSeconds,
    error,
    handleResend,
    resetCooldown,
    canResend: cooldownSeconds === 0 && !isPending
  };
} 