import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";

/*
  WMO weather-code mapping.

  `scene` is the dial that drives the living SkyBackground — it decides how the
  whole page looks. This is a deliberately opinionated grouping; it's one of the
  spots meant to be tuned. e.g. you could split "rain" into light vs heavy, or
  make fog its own washed-out scene.
*/
export type SkyScene =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "rain"
  | "snow"
  | "storm";

export interface WeatherInfo {
  label: string;
  scene: SkyScene;
  /** Icon keys resolve to a day or night Lucide glyph via `weatherIcon`. */
  iconKey: IconKey;
}

type IconKey =
  | "clear"
  | "partly"
  | "cloud"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "rainHeavy"
  | "snow"
  | "snowGrains"
  | "storm";

const CODE_MAP: Record<number, WeatherInfo> = {
  0: { label: "Clear sky", scene: "clear", iconKey: "clear" },
  1: { label: "Mainly clear", scene: "clear", iconKey: "partly" },
  2: { label: "Partly cloudy", scene: "partly", iconKey: "partly" },
  3: { label: "Overcast", scene: "cloudy", iconKey: "overcast" },
  45: { label: "Fog", scene: "fog", iconKey: "fog" },
  48: { label: "Rime fog", scene: "fog", iconKey: "fog" },
  51: { label: "Light drizzle", scene: "rain", iconKey: "drizzle" },
  53: { label: "Drizzle", scene: "rain", iconKey: "drizzle" },
  55: { label: "Dense drizzle", scene: "rain", iconKey: "rain" },
  56: { label: "Freezing drizzle", scene: "rain", iconKey: "drizzle" },
  57: { label: "Freezing drizzle", scene: "rain", iconKey: "rain" },
  61: { label: "Light rain", scene: "rain", iconKey: "rain" },
  63: { label: "Rain", scene: "rain", iconKey: "rain" },
  65: { label: "Heavy rain", scene: "rain", iconKey: "rainHeavy" },
  66: { label: "Freezing rain", scene: "rain", iconKey: "rain" },
  67: { label: "Freezing rain", scene: "rain", iconKey: "rainHeavy" },
  71: { label: "Light snow", scene: "snow", iconKey: "snow" },
  73: { label: "Snow", scene: "snow", iconKey: "snow" },
  75: { label: "Heavy snow", scene: "snow", iconKey: "snow" },
  77: { label: "Snow grains", scene: "snow", iconKey: "snowGrains" },
  80: { label: "Rain showers", scene: "rain", iconKey: "rain" },
  81: { label: "Rain showers", scene: "rain", iconKey: "rain" },
  82: { label: "Violent showers", scene: "storm", iconKey: "rainHeavy" },
  85: { label: "Snow showers", scene: "snow", iconKey: "snow" },
  86: { label: "Heavy snow showers", scene: "snow", iconKey: "snow" },
  95: { label: "Thunderstorm", scene: "storm", iconKey: "storm" },
  96: { label: "Storm with hail", scene: "storm", iconKey: "storm" },
  99: { label: "Severe storm", scene: "storm", iconKey: "storm" },
};

const FALLBACK: WeatherInfo = {
  label: "Unknown",
  scene: "cloudy",
  iconKey: "cloud",
};

export function getWeatherInfo(code: number): WeatherInfo {
  return CODE_MAP[code] ?? FALLBACK;
}

// Day / night icon pairs. Only the clear-ish keys differ by time of day.
const ICONS: Record<IconKey, { day: LucideIcon; night: LucideIcon }> = {
  clear: { day: Sun, night: Moon },
  partly: { day: CloudSun, night: CloudMoon },
  cloud: { day: Cloud, night: Cloud },
  overcast: { day: Cloudy, night: Cloudy },
  fog: { day: CloudFog, night: CloudFog },
  drizzle: { day: CloudDrizzle, night: CloudDrizzle },
  rain: { day: CloudRain, night: CloudRain },
  rainHeavy: { day: CloudRainWind, night: CloudRainWind },
  snow: { day: CloudSnow, night: CloudSnow },
  snowGrains: { day: Snowflake, night: Snowflake },
  storm: { day: CloudLightning, night: CloudLightning },
};

export function weatherIcon(code: number, isDay: boolean): LucideIcon {
  const { iconKey } = getWeatherInfo(code);
  return isDay ? ICONS[iconKey].day : ICONS[iconKey].night;
}
