"use client";

import React, { useState, forwardRef } from "react";
import { cn } from "@/_lib/utils";
import { FieldError } from "./field-error";

export interface PhoneInputProps {
    /** Set field label */
    label?: string;
    /** Show error message using this prop */
    error?: string;
    /** The size of the component */
    size?: "sm" | "DEFAULT" | "lg" | "xl";
    /** The rounded variants */
    rounded?: "none" | "sm" | "DEFAULT" | "lg" | "pill";
    /** Add custom classes for the input field */
    inputClassName?: string;
    /** Use labelClassName prop to do some addition style for the field label */
    labelClassName?: string;
    /** Add custom classes into the component wrapper for extra style like spacing */
    className?: string;
    /** Disable default styling and use only custom classes */
    unstyled?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Value of the input */
    value?: string;
    /** onChange handler */
    onChange?: (value: string) => void;
    /** onBlur handler */
    onBlur?: () => void;
    /** onFocus handler */
    onFocus?: () => void;
    /** Disable the input */
    disabled?: boolean;
    /** Make the input required */
    required?: boolean;
    /** Name attribute for the input */
    name?: string;
    /** ID attribute for the input */
    id?: string;
    /** Ref for the input */
    ref?: React.Ref<HTMLInputElement>;
}

const labelClasses = {
    size: {
        sm: "text-xs mb-1",
        DEFAULT: "text-sm mb-1.5",
        lg: "text-base mb-2",
        xl: "text-lg mb-2",
    },
};

const inputClasses = {
    base: "flex items-center w-full border border-gray-300 bg-white text-gray-900 transition-colors focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500",
    size: {
        sm: "px-3 py-1 text-xs h-8",
        DEFAULT: "px-4 py-2 text-sm h-10",
        lg: "px-4 py-2 text-base h-12",
        xl: "px-5 py-2.5 text-base h-14",
    },
    rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        DEFAULT: "rounded-md",
        lg: "rounded-lg",
        pill: "rounded-full",
    },
    error: "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/30",
    disabled: "opacity-50 cursor-not-allowed",
};

// Australian phone number formatting function
const formatAustralianPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // If it's an Australian number (starts with 61 or 0)
  if (digits.startsWith('61')) {
    const number = digits.substring(2); // Remove 61
    return formatNumber(number);
  } else if (digits.startsWith('0')) {
    const number = digits.substring(1); // Remove leading 0
    return formatNumber(number);
  } else {
    return formatNumber(digits);
  }
};

const formatNumber = (digits: string): string => {
  // Australian mobile numbers (04XX XXX XXX)
  if (digits.startsWith('4') && digits.length >= 2) {
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
    }
  }
  
  // Australian landline numbers (02 XXXX XXXX, 03 XXXX XXXX, etc.)
  if (digits.startsWith('2') || digits.startsWith('3') || digits.startsWith('7') || digits.startsWith('8')) {
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
    }
  }
  
  // For any other number, just format with spaces
  if (digits.length <= 4) {
    return digits;
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  } else {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  }
};

// Validate Australian phone number
const validateAustralianPhoneNumber = (value: string): boolean => {
    const digits = value.replace(/\D/g, '');

    // Australian phone numbers should be 9 digits (excluding country code)
    if (digits.length < 9) return false;

    // First digit should be 2-9 for valid Australian numbers
    const firstDigit = digits.charAt(0);
    return /^[2-9]/.test(firstDigit);
};

/**
 * A phone input component with Australian flag and +61 country code
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(({
    size = "DEFAULT",
    rounded = "DEFAULT",
    label,
    error,
    unstyled,
    labelClassName,
    inputClassName,
    className,
    placeholder = "Enter your Phone Number",
    value = "",
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    required = false,
    name,
    id,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        // Only allow numbers, spaces, hyphens, and parentheses
        const cleanedValue = inputValue.replace(/[^0-9\s\-\(\)]/g, '');
        
        // Limit to reasonable length (max 12 digits for Australian numbers)
        const limitedValue = cleanedValue.replace(/\D/g, '').slice(0, 12);
        
        // Format the number for Australian format
        const formattedValue = formatAustralianPhoneNumber(limitedValue);
        
        // Always update the value to allow typing
        onChange?.(formattedValue);
    };

    return (
        <div className={cn("w-full", className)}>
            {/* Label */}
            {label && (
                <label
                    className={cn(
                        "block font-medium text-gray-900",
                        labelClasses.size[size],
                        labelClassName
                    )}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div
                className={cn(
                    inputClasses.base,
                    inputClasses.size[size],
                    inputClasses.rounded[rounded],
                    error && inputClasses.error,
                    disabled && inputClasses.disabled,
                    inputClassName
                )}
            >
                {/* Australian Flag and Country Code */}
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                        <img
                            src="/images/vectors/aus-flag.png"
                            alt="Australia"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-gray-700 text-sm font-medium mr-2 flex-shrink-0">
                        +61
                    </span>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-gray-300 mx-2 flex-shrink-0"></div>

                {/* Phone Number Input */}
                <input
                    ref={ref}
                    type="tel"
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    name={name}
                    id={id}
                    className="flex-1 min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-gray-400"
                    {...props}
                />
            </div>

            {/* Error Message */}
            {error && <FieldError error={error} />}
        </div>
    );
});

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };