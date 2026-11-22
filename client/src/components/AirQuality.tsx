import { Wind } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { aqiCategory } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AirQuality as AirQualityData } from "@/api/airQuality";

export function AirQuality({ data }: { data: AirQualityData }) {
  const eu = aqiCategory(data.europeanAqi);
  const hasData = data.europeanAqi != null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Reveal>
        <p className="eyebrow mb-1">Air quality</p>
        <h2 className="mb-6 font-display text-2xl font-bold text-fg sm:text-3xl">
          What you're breathing
        </h2>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glass grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          {/* AQI dial */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex size-24 flex-col items-center justify-center rounded-full border-4 bg-[rgb(var(--glass-rgb)/0.35)]",
                hasData ? eu.border : "border-muted"
              )}
            >
              <span className="font-mono text-3xl font-bold text-fg">
                {hasData ? Math.round(data.europeanAqi!) : "—"}
              </span>
              <span className="font-mono text-[0.6rem] uppercase tracking-wide text-fg/50">
                EU AQI
              </span>
            </div>
            <div>
              <p className={cn("font-display text-xl font-bold", eu.tone)}>
                {eu.label}
              </p>
              <p className="mt-1 flex items-center gap-1 text-sm text-fg/60">
                <Wind className="size-4" />
                {data.usAqi != null ? `US AQI ${Math.round(data.usAqi)}` : "European index"}
              </p>
            </div>
          </div>

          {/* Particulates */}
          <div className="grid gap-4 sm:border-l sm:border-white/40 sm:pl-6">
            <Particulate label="PM2.5" value={data.pm25} max={50} unit="µg/m³" />
            <Particulate label="PM10" value={data.pm10} max={100} unit="µg/m³" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Particulate({
  label,
  value,
  max,
  unit,
}: {
  label: string;
  value: number | null;
  max: number;
  unit: string;
}) {
  const pct = value == null ? 0 : Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-mono text-xs uppercase tracking-wide text-fg/60">
          {label}
        </span>
        <span className="font-mono text-sm font-semibold text-fg">
          {value == null ? "—" : value.toFixed(1)}{" "}
          <span className="text-fg/45">{unit}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
