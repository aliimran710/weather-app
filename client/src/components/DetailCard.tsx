import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { usePointerTilt } from "@/hooks/usePointerTilt";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/* A frosted instrument panel that tilts toward the pointer in 3D. */
export function DetailCard({
  icon: Icon,
  label,
  value,
  unit,
  sub,
  children,
  className,
}: Props) {
  const tilt = usePointerTilt();

  return (
    <div className="perspective">
      <div
        ref={tilt.ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        style={tilt.style}
        className={cn(
          "glass preserve-3d group flex h-full flex-col gap-3 p-5 hover:shadow-lift",
          className
        )}
      >
        <div className="flex items-center gap-2 text-accent/70">
          <Icon className="size-4" strokeWidth={2} />
          <span className="eyebrow !text-accent/70">{label}</span>
        </div>

        <div className="flex items-end gap-1">
          <span className="font-mono text-3xl font-semibold leading-none text-fg">
            {value}
          </span>
          {unit && (
            <span className="mb-0.5 font-mono text-sm text-fg/55">{unit}</span>
          )}
        </div>

        {children}

        {sub && <p className="mt-auto text-xs text-fg/60">{sub}</p>}
      </div>
    </div>
  );
}
