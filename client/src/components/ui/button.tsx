import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-sky-deep text-cloud shadow-glass-sm hover:bg-sky-deep/90 hover:shadow-glass active:scale-[0.98]",
        sun: "bg-sun text-fg shadow-glass-sm hover:brightness-105 active:scale-[0.98]",
        glass:
          "border border-[rgb(var(--glass-border)/0.5)] bg-[rgb(var(--glass-rgb)/0.35)] text-fg backdrop-blur-xl hover:bg-[rgb(var(--glass-rgb)/0.5)] active:scale-[0.98]",
        ghost: "text-fg/80 hover:bg-white/40 hover:text-fg",
        outline:
          "border border-sky-deep/25 bg-transparent text-accent hover:bg-sky-deep/5",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-8 text-base",
        icon: "size-10",
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
