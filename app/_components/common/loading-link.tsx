"use client";

import Link from "next/link";
import { useLoading } from "./loading-provider";
import { cn } from "../../_utils/common";

interface LoadingLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

export function LoadingLink({ 
  href, 
  children, 
  className, 
  onClick,
  ...props 
}: LoadingLinkProps) {
  const { showLoading } = useLoading();

  const handleClick = () => {
    showLoading();
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn("transition-opacity hover:opacity-80", className)}
      {...props}
    >
      {children}
    </Link>
  );
} 