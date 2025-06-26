import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/_lib/utils";
import Loader from "./loader/loader";

const puppyButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold ring-offset-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/90",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
        outline:
          "border border-neutral-300 text-neutral-900 hover:bg-neutral-100",
        ghost: "hover:bg-neutral-100",
      },
      size: {
        default: "px-6 py-3 text-sm xl:text-base",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface PuppyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof puppyButtonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  iconSrc?: string;
  altText?: string;
}

const PuppyButton = React.forwardRef<HTMLButtonElement, PuppyButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      iconSrc,
      altText = "Icon",
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(puppyButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {iconSrc && (
              <img
                src={iconSrc}
                alt={altText}
                className="w-6 h-6 xl:w-[26px] xl:h-[26px] mr-2 "
              />
            )}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

PuppyButton.displayName = "PuppyButton";

export { PuppyButton, puppyButtonVariants };
