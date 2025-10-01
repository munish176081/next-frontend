"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/_lib/utils';

export interface RadioButtonGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RadioButtonGroup = forwardRef<HTMLDivElement, RadioButtonGroupProps>(
  ({ 
    name, 
    value, 
    onChange, 
    options, 
    label, 
    error, 
    disabled = false, 
    className,
    size = 'md'
  }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        
        <div className="flex gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={cn(
                'flex-1 rounded-md border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
                sizeClasses[size],
                value === option.value
                  ? 'bg-purple-600 text-white border-purple-600 focus:ring-purple-500'
                  : 'bg-white text-purple-600 border-purple-200 hover:border-purple-300 focus:ring-purple-500',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

RadioButtonGroup.displayName = 'RadioButtonGroup';
