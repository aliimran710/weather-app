import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent/15 text-accent",
        sun: "border-transparent bg-sun/25 text-fg",
        outline: "border-sky-deep/25 text-accent",
        glass: "border-white/50 bg-white/30 text-fg backdrop-blur",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
