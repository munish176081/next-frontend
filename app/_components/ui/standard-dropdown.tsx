"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/_lib/utils";

const StandardDropdown = SelectPrimitive.Root;

const StandardDropdownGroup = SelectPrimitive.Group;

const StandardDropdownValue = SelectPrimitive.Value;

interface StandardDropdownTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  error?: string;
}

const StandardDropdownTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  StandardDropdownTriggerProps
>(({ className, children, error, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styling matching the application theme
      "text-base max-md:text-xs max-md:px-4 placeholder:text-[#4B4A4A8C] font-normal outline-none px-6 w-full h-[70px] rounded-full border border-[#B5B5B5] max-md:h-12",
      "flex items-center justify-between bg-white",
      "focus:outline-none focus:ring-2 focus:ring-CPrimary focus:ring-opacity-50 focus:border-CPrimary",
      "hover:border-gray-400 transition-colors",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
      "[&>span]:line-clamp-1 [&>span]:text-left",
      error && "border-red-500 focus:ring-red-500 focus:border-red-500",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-5 w-5 text-[#4B4A4A8C] flex-shrink-0" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
StandardDropdownTrigger.displayName = SelectPrimitive.Trigger.displayName;

const StandardDropdownScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4 rotate-180" />
  </SelectPrimitive.ScrollUpButton>
));
StandardDropdownScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const StandardDropdownScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
StandardDropdownScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const StandardDropdownContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <StandardDropdownScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-2",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <StandardDropdownScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
StandardDropdownContent.displayName = SelectPrimitive.Content.displayName;

const StandardDropdownLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-2 pl-6 pr-2 text-sm font-semibold text-gray-700", className)}
    {...props}
  />
));
StandardDropdownLabel.displayName = SelectPrimitive.Label.displayName;

const StandardDropdownItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-3 pl-6 pr-2 text-sm outline-none",
      "focus:bg-CPrimary focus:bg-opacity-10 focus:text-gray-900",
      "hover:bg-gray-50 transition-colors",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-CPrimary" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText className="font-medium">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
StandardDropdownItem.displayName = SelectPrimitive.Item.displayName;

const StandardDropdownSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
));
StandardDropdownSeparator.displayName = SelectPrimitive.Separator.displayName;

// Enhanced wrapper component with label and error support
interface StandardDropdownWrapperProps {
  label?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

const StandardDropdownWrapper: React.FC<StandardDropdownWrapperProps> = ({
  label,
  required,
  error,
  children,
  className
}) => (
  <div className={cn("flex flex-col w-full", className)}>
    {label && (
      <label className="mt-6 max-md:mt-3 mb-2 flex font-medium max-md:text-sm">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && (
      <span className="text-red-500 text-sm mt-1">{error}</span>
    )}
  </div>
);

export {
  StandardDropdown,
  StandardDropdownGroup,
  StandardDropdownValue,
  StandardDropdownTrigger,
  StandardDropdownContent,
  StandardDropdownLabel,
  StandardDropdownItem,
  StandardDropdownSeparator,
  StandardDropdownScrollUpButton,
  StandardDropdownScrollDownButton,
  StandardDropdownWrapper,
};
