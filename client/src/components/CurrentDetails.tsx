import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Sun,
  Sunrise,
  Sunset,
  Navigation,
  Waves,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { DetailCard } from "@/components/DetailCard";
import { useUnits } from "@/hooks/useUnits";
import {
  formatTemp,
  tempUnitLabel,
  formatWind,
  windUnitLabel,
  degToCompass,
  formatClock,
  formatVisibility,
  uvCategory,
  humidityComfort,
} from "@/lib/format";
import type { CurrentWeather, DailyPoint } from "@/api/weather";

interface Props {
  current: CurrentWeather;
  today: DailyPoint;
}

export function CurrentDetails({ current, today }: Props) {
  const { tempUnit, windUnit } = useUnits();
  const uv = uvCategory(current.uvIndex);

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-10">
      <Reveal>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-1">Right now</p>
            <h2 className="font-display text-2xl font-bold text-fg sm:text-3xl">
              Current conditions
            </h2>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Reveal delay={0.02}>
          <DetailCard
            icon={Thermometer}
            label="Feels like"
            value={formatTemp(current.apparentTemperature, tempUnit, false)}
            unit={tempUnitLabel(tempUnit)}
            sub={`Actual ${formatTemp(current.temperature, tempUnit)}`}
          />
        </Reveal>

        <Reveal delay={0.05}>
          <DetailCard
            icon={Droplets}
            label="Humidity"
            value={Math.round(current.humidity)}
            unit="%"
            sub={humidityComfort(current.humidity)}
          />
        </Reveal>

        <Reveal delay={0.08}>
          <DetailCard
            icon={Wind}
            label="Wind"
            value={formatWind(current.windSpeed, windUnit)}
            unit={windUnitLabel(windUnit)}
            sub={`From ${degToCompass(current.windDirection)} (${Math.round(current.windDirection)}°)`}
          >
            <WindCompass deg={current.windDirection} />
          </DetailCard>
        </Reveal>

        <Reveal delay={0.11}>
          <DetailCard
            icon={Gauge}
            label="Wind gusts"
            value={formatWind(current.windGusts, windUnit)}
            unit={windUnitLabel(windUnit)}
            sub="Peak now"
          />
        </Reveal>

        <Reveal delay={0.14}>
          <DetailCard
            icon={Gauge}
            label="Pressure"
            value={Math.round(current.pressure)}
            unit="hPa"
            sub="Surface"
          />
        </Reveal>

        <Reveal delay={0.17}>
          <DetailCard
            icon={Eye}
            label="Visibility"
            value={formatVisibility(current.visibility)}
            sub="Horizontal"
          />
        </Reveal>

        <Reveal delay={0.2}>
          <DetailCard
            icon={Sun}
            label="UV index"
            value={current.uvIndex == null ? "—" : Math.round(current.uvIndex)}
            sub={<span className={uv.tone}>{uv.label}</span>}
          />
        </Reveal>

        <Reveal delay={0.23}>
          <DetailCard
            icon={Waves}
            label="Dew point"
            value={
              current.dewPoint == null
                ? "—"
                : formatTemp(current.dewPoint, tempUnit, false)
            }
            unit={current.dewPoint == null ? undefined : tempUnitLabel(tempUnit)}
            sub="Moisture"
          />
        </Reveal>

        <Reveal delay={0.26} className="col-span-2 md:col-span-1">
          <DetailCard
            icon={Sunrise}
            label="Sun"
            value={formatClock(today.sunrise)}
            sub={
              <span className="flex items-center gap-1">
                <Sunset className="size-3.5 text-sun" />
                Sets {formatClock(today.sunset)}
              </span>
            }
          />
        </Reveal>
      </div>
    </section>
  );
}

/* Small compass with an arrow pointing the way the wind blows FROM. */
function WindCompass({ deg }: { deg: number }) {
  return (
    <div className="relative mt-1 size-10 rounded-full border border-white/50 bg-white/20">
      <span className="absolute left-1/2 top-0.5 -translate-x-1/2 font-mono text-[0.5rem] text-fg/50">
        N
      </span>
      <Navigation
        className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 fill-accent text-accent"
        style={{ transform: `translate(-50%, -50%) rotate(${deg + 180}deg)` }}
        strokeWidth={1.5}
      />
    </div>
  );
}
