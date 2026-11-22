import { motion } from "framer-motion";
import { MapPin, ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { useUnits } from "@/hooks/useUnits";
import { getWeatherInfo, weatherIcon } from "@/lib/weatherCodes";
import { formatTemp, tempUnitLabel, formatClock } from "@/lib/format";
import type { CurrentWeather, DailyPoint } from "@/api/weather";

interface Props {
  place: string;
  current: CurrentWeather;
  today: DailyPoint;
}

export function Hero({ place, current, today }: Props) {
  const { tempUnit } = useUnits();
  const info = getWeatherInfo(current.weatherCode);
  const Icon = weatherIcon(current.weatherCode, current.isDay);

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 pb-16 pt-28 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <div className="flex items-center gap-2 rounded-full border border-[rgb(var(--glass-border)/0.4)] bg-[rgb(var(--glass-rgb)/0.4)] px-4 py-1.5 backdrop-blur-xl">
          <MapPin className="size-4 text-accent" />
          <span className="text-sm font-medium text-fg">{place}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
        >
          <Icon
            className="size-24 text-fg drop-shadow-[0_8px_24px_rgba(10,61,107,0.35)] sm:size-28"
            strokeWidth={1.5}
          />
        </motion.div>

        <div className="mt-2 flex items-start font-display font-bold leading-none tracking-tighter text-fg">
          <span className="text-[6.5rem] sm:text-[9rem]">
            {formatTemp(current.temperature, tempUnit, false)}
          </span>
          <span className="mt-4 text-4xl text-fg/60 sm:mt-6 sm:text-5xl">
            {tempUnitLabel(tempUnit)}
          </span>
        </div>

        <p className="-mt-2 font-display text-2xl font-semibold text-fg sm:text-3xl">
          {info.label}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-fg/75">
          <span>
            Feels like{" "}
            <strong className="font-semibold text-fg">
              {formatTemp(current.apparentTemperature, tempUnit)}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            <ArrowUp className="size-4 text-rose-500/80" />
            {formatTemp(today.tempMax, tempUnit)}
            <ArrowDown className="ml-2 size-4 text-accent/80" />
            {formatTemp(today.tempMin, tempUnit)}
          </span>
        </div>

        <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-fg/45">
          Updated {formatClock(current.time)}
        </p>
      </motion.div>

      {/* Scroll affordance */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-fg/50"
        >
          <span className="eyebrow mb-1">Scroll</span>
          <ChevronDown className="size-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
