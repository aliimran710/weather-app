import { Droplet } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useUnits } from "@/hooks/useUnits";
import { weatherIcon } from "@/lib/weatherCodes";
import { formatTemp, formatHourLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { HourlyPoint } from "@/api/weather";

export function HourlyForecast({ hourly }: { hourly: HourlyPoint[] }) {
  const { tempUnit } = useUnits();

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Reveal>
        <p className="eyebrow mb-1">Next 24 hours</p>
        <h2 className="mb-6 font-display text-2xl font-bold text-fg sm:text-3xl">
          Hourly
        </h2>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glass scrollbar-sky flex gap-2 overflow-x-auto p-3">
          {hourly.map((h, i) => {
            const Icon = weatherIcon(h.weatherCode, h.isDay);
            const now = i === 0;
            return (
              <div
                key={h.time}
                className={cn(
                  "flex min-w-[68px] flex-col items-center gap-2 rounded-lg px-2 py-3 transition-colors",
                  now ? "bg-accent/15" : "hover:bg-white/40"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-xs",
                    now ? "font-semibold text-accent" : "text-fg/60"
                  )}
                >
                  {formatHourLabel(h.time, now)}
                </span>
                <Icon className="size-6 text-accent" strokeWidth={1.75} />
                <span className="font-display text-lg font-semibold text-fg">
                  {formatTemp(h.temperature, tempUnit)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-mono text-[0.65rem]",
                    h.precipitationProbability >= 30
                      ? "text-accent"
                      : "text-fg/35"
                  )}
                >
                  <Droplet className="size-2.5" />
                  {h.precipitationProbability}%
                </span>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
