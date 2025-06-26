"use client";

import React, { useState } from "react";
import { Button } from "./button";
import Loader from "./loader/loader";
import { cn } from "../../_utils/common";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LoadingButton({
  children,
  loading = false,
  loadingText = "Loading...",
  onClick,
  variant = "default",
  size = "default",
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      setIsLoading(true);
      try {
        await onClick(e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isButtonLoading = loading || isLoading;

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isButtonLoading}
      onClick={handleClick}
      className={cn("relative", className)}
      {...props}
    >
      {isButtonLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader size="sm" color="current" />
        </div>
      )}
      <span className={cn(isButtonLoading && "opacity-0")}>
        {isButtonLoading ? loadingText : children}
      </span>
    </Button>
  );
} 