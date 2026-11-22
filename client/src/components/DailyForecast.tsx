import { Droplet } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useUnits } from "@/hooks/useUnits";
import { getWeatherInfo, weatherIcon } from "@/lib/weatherCodes";
import { formatTemp, formatDayLabel } from "@/lib/format";
import type { DailyPoint } from "@/api/weather";

export function DailyForecast({ daily }: { daily: DailyPoint[] }) {
  const { tempUnit } = useUnits();

  // Week-wide range, so each day's bar is positioned on a shared scale.
  const weekMin = Math.min(...daily.map((d) => d.tempMin));
  const weekMax = Math.max(...daily.map((d) => d.tempMax));
  const span = Math.max(weekMax - weekMin, 1);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Reveal>
        <p className="eyebrow mb-1">Week ahead</p>
        <h2 className="mb-6 font-display text-2xl font-bold text-fg sm:text-3xl">
          7-day forecast
        </h2>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="glass divide-y divide-white/40 p-2">
          {daily.map((d, i) => {
            const Icon = weatherIcon(d.weatherCode, true);
            const info = getWeatherInfo(d.weatherCode);
            const left = ((d.tempMin - weekMin) / span) * 100;
            const width = ((d.tempMax - d.tempMin) / span) * 100;
            return (
              <div
                key={d.date}
                className="grid grid-cols-[3.2rem_1.75rem_1fr] items-center gap-3 px-3 py-3 sm:grid-cols-[4rem_2rem_2.5rem_1fr_auto]"
              >
                <span className="font-display text-sm font-semibold text-fg">
                  {formatDayLabel(d.date, i === 0)}
                </span>

                <Icon
                  className="size-6 text-accent"
                  strokeWidth={1.75}
                  aria-label={info.label}
                />

                <span className="hidden items-center gap-0.5 font-mono text-[0.7rem] text-accent sm:flex">
                  <Droplet className="size-2.5" />
                  {d.precipitationProbabilityMax}%
                </span>

                {/* Temperature range bar */}
                <div className="flex items-center gap-3">
                  <span className="w-8 text-right font-mono text-sm text-fg/55">
                    {formatTemp(d.tempMin, tempUnit)}
                  </span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-white/40">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-pale via-sky to-sun"
                      style={{ left: `${left}%`, width: `${Math.max(width, 6)}%` }}
                    />
                  </div>
                  <span className="w-8 font-mono text-sm font-semibold text-fg">
                    {formatTemp(d.tempMax, tempUnit)}
                  </span>
                </div>

                <span className="hidden text-right text-xs text-fg/55 sm:block">
                  {info.label}
                </span>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
