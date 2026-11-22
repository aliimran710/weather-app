import { useUnits } from "@/hooks/useUnits";
import { cn } from "@/lib/utils";

/* Segmented pills for temperature and wind units. */
export function UnitToggle() {
  const { tempUnit, windUnit, toggleTemp, toggleWind } = useUnits();

  return (
    <div className="flex items-center gap-2">
      <Segment
        options={[
          { key: "c", label: "°C" },
          { key: "f", label: "°F" },
        ]}
        active={tempUnit}
        onToggle={toggleTemp}
      />
      <Segment
        options={[
          { key: "kmh", label: "km/h" },
          { key: "mph", label: "mph" },
        ]}
        active={windUnit}
        onToggle={toggleWind}
      />
    </div>
  );
}

function Segment({
  options,
  active,
  onToggle,
}: {
  options: { key: string; label: string }[];
  active: string;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-[rgb(var(--glass-border)/0.4)] bg-[rgb(var(--glass-rgb)/0.4)] p-0.5 font-mono text-xs backdrop-blur-xl">
      {options.map((opt) => {
        const isActive = opt.key === active;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => !isActive && onToggle()}
            aria-pressed={isActive}
            className={cn(
              "rounded-full px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-sky-deep text-cloud shadow-glass-sm"
                : "text-fg/70 hover:text-fg"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
