'use client';

import React from 'react';
import Image from 'next/image';
import { BadgeConfig, getBadgeConfig } from '@/_config/badge-config';

interface BadgeProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'selectable' | 'display' | 'compact';
  selected?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-20 h-20',
  lg: 'w-24 h-24'
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

export default function Badge({
  value,
  size = 'md',
  variant = 'display',
  selected = false,
  onClick,
  showLabel = true,
  className = ''
}: BadgeProps) {
  const badgeConfig = getBadgeConfig(value);
  
  if (!badgeConfig) {
    // Fallback for unknown badges
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className={`${sizeClasses[size]} bg-gray-200 rounded-lg flex items-center justify-center`}>
          <span className="text-gray-500 text-xs">?</span>
        </div>
        {showLabel && (
          <span className={`${labelSizeClasses[size]} text-gray-600 text-center mt-1 max-w-[80px] leading-tight`}>
            {value}
          </span>
        )}
      </div>
    );
  }

  const { icon, iconAlt, color, label } = badgeConfig;
  const isSelectable = variant === 'selectable' && onClick;

  const handleClick = () => {
    if (isSelectable) {
      onClick();
    }
  };

  const baseClasses = `
    relative flex flex-col items-center transition-all duration-200
    ${isSelectable ? 'cursor-pointer' : ''}
    ${className}
  `;

  const iconClasses = `
    ${sizeClasses[size]} rounded-full border-2 transition-all duration-200
    ${selected 
      ? 'border-yellow-400 shadow-lg scale-105' 
      : 'border-yellow-300 hover:scale-105'
    }
    ${isSelectable ? 'hover:shadow-md' : ''}
  `;

  return (
    <div className={baseClasses} onClick={handleClick}>
      <div className="relative">
        {/* Badge Icon */}
        <div 
          className={iconClasses}
        >
          <div className="w-full h-full flex items-center justify-center p-2">
            <Image
              src={icon}
              alt={label}
              width={size === 'sm' ? 48 : size === 'md' ? 64 : 80}
              height={size === 'sm' ? 48 : size === 'md' ? 64 : 80}
              className="object-contain"
              onError={(e) => {
                // Fallback to alt image if main icon fails
                if (iconAlt) {
                  const target = e.target as HTMLImageElement;
                  target.src = iconAlt;
                }
              }}
            />
          </div>
        </div>

        {/* Selection Indicator */}
        {variant === 'selectable' && (
          <div className="absolute -top-1 -right-1">
            <div 
              className={`
                w-5 h-5 rounded-full border-2 border-white shadow-sm
                ${selected 
                  ? 'bg-green-500' 
                  : 'bg-gray-300'
                }
              `}
            >
              {selected && (
                <svg className="w-3 h-3 text-white m-auto mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Display Badge - Show checkmark overlay */}
        {variant === 'display' && selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-green-500 rounded-full p-1 shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Badge Label */}
      {showLabel && (
        <span 
          className={`
            ${labelSizeClasses[size]} font-medium text-center mt-1 max-w-[70px] leading-tight
            ${selected ? 'text-gray-900' : 'text-gray-700'}
          `}
        >
          {label}
        </span>
      )}

      {/* Compact variant - show label as overlay */}
      {variant === 'compact' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 rounded px-2 py-1">
            <span className="text-white text-xs font-medium text-center">
              {label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 