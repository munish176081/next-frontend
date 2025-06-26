import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/_lib/utils";
import Loader from "./loader/loader";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90",
        destructive: "bg-red-500 text-neutral-50 hover:bg-red-500/90",
        outline:
          "border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
        ghost: "hover:bg-neutral-100 hover:text-neutral-900",
        link: "text-neutral-900 underline-offset-4 hover:underline",
      },
      size: {
        auto: "h-auto px-2 py-1",
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingVariant?: "default" | "outline";
  unstyled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      children,
      loadingVariant = "outline",
      disabled,
      unstyled = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    if (unstyled) {
      return (
        <Comp
          className={className}
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? <Loader /> : children}
        </Comp>
      );
    }
    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: isLoading ? loadingVariant : variant,
            size,
            className,
          })
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader /> : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
