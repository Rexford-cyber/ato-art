import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "rounded-md border border-transparent",
    "text-sm font-medium whitespace-nowrap",
    "outline-none select-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "transition-[transform,background-color,border-color,color] duration-[180ms]",
    "[transition-timing-function:cubic-bezier(0.25,1,0.5,1)]",
    "active:duration-[120ms] active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[oklch(0.48_0.150_32)] active:bg-[oklch(0.48_0.150_32)]",
        outline:
          "border-border bg-surface text-ink hover:bg-muted hover:border-ink-muted/30",
        secondary:
          "bg-muted text-ink hover:bg-[oklch(0.90_0.014_65)]",
        ghost:
          "text-ink hover:bg-muted",
        destructive:
          "bg-destructive text-[oklch(0.97_0.012_70)] hover:bg-[oklch(0.45_0.155_25)]",
        link:
          "text-primary underline-offset-4 hover:underline active:scale-[1]",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 rounded px-2 text-xs",
        sm: "h-8 rounded px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-[15px]",
        xl: "h-12 rounded-md px-8 text-base",
        icon: "size-9",
        "icon-xs": "size-6 rounded",
        "icon-sm": "size-8 rounded",
        "icon-lg": "size-11",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
