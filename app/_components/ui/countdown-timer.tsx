"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
  showSeconds?: boolean;
}

export function CountdownTimer({ 
  seconds, 
  onComplete, 
  className = "",
  showSeconds = true 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    
    if (showSeconds) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  if (timeLeft <= 0) {
    return null;
  }

  return (
    <span className={`font-medium ${className}`}>
      {formatTime(timeLeft)}
    </span>
  );
} 