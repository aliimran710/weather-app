/*
  Formatting + unit conversion. The API is always fetched in metric; these
  helpers convert for display so the unit toggle never triggers a refetch.
*/
export type TempUnit = "c" | "f";
export type WindUnit = "kmh" | "mph";

export function toF(celsius: number): number {
  return celsius * 1.8 + 32;
}

export function formatTemp(celsius: number, unit: TempUnit, withDegree = true): string {
  const value = unit === "f" ? toF(celsius) : celsius;
  const rounded = Math.round(value);
  return withDegree ? `${rounded}°` : `${rounded}`;
}

export function tempUnitLabel(unit: TempUnit): string {
  return unit === "f" ? "°F" : "°C";
}

export function formatWind(kmh: number, unit: WindUnit): string {
  const value = unit === "mph" ? kmh * 0.621371 : kmh;
  return `${Math.round(value)}`;
}

export function windUnitLabel(unit: WindUnit): string {
  return unit === "mph" ? "mph" : "km/h";
}

const COMPASS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

export function degToCompass(deg: number): string {
  return COMPASS[Math.round(deg / 22.5) % 16];
}

/** "9:41 AM" in the location's local time (API already returns local ISO). */
export function formatClock(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Short hour label for the hourly strip: "2 PM", or "Now" for the first slot. */
export function formatHourLabel(iso: string, isNow: boolean): string {
  if (isNow) return "Now";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric" });
}

/** "Mon", or "Today" for the current day. */
export function formatDayLabel(iso: string, isToday: boolean): string {
  if (isToday) return "Today";
  return new Date(iso).toLocaleDateString([], { weekday: "short" });
}

export function formatVisibility(meters: number | null): string {
  if (meters == null) return "—";
  const km = meters / 1000;
  return km >= 10 ? ">10 km" : `${km.toFixed(1)} km`;
}

export function uvCategory(uv: number | null): { label: string; tone: string } {
  if (uv == null) return { label: "—", tone: "text-muted-foreground" };
  const v = Math.round(uv);
  if (v <= 2) return { label: "Low", tone: "text-emerald-600" };
  if (v <= 5) return { label: "Moderate", tone: "text-amber-500" };
  if (v <= 7) return { label: "High", tone: "text-orange-500" };
  if (v <= 10) return { label: "Very high", tone: "text-rose-500" };
  return { label: "Extreme", tone: "text-fuchsia-600" };
}

/*
  European AQI bands (Open-Meteo). `border` is a literal class (not built by
  string-manipulation) so Tailwind's JIT scanner keeps it in the bundle.
*/
export function aqiCategory(aqi: number | null): {
  label: string;
  tone: string;
  border: string;
} {
  if (aqi == null)
    return { label: "—", tone: "text-muted-foreground", border: "border-muted" };
  if (aqi <= 20) return { label: "Good", tone: "text-emerald-600", border: "border-emerald-500" };
  if (aqi <= 40) return { label: "Fair", tone: "text-lime-600", border: "border-lime-500" };
  if (aqi <= 60) return { label: "Moderate", tone: "text-amber-500", border: "border-amber-500" };
  if (aqi <= 80) return { label: "Poor", tone: "text-orange-500", border: "border-orange-500" };
  if (aqi <= 100) return { label: "Very poor", tone: "text-rose-500", border: "border-rose-500" };
  return { label: "Extremely poor", tone: "text-fuchsia-600", border: "border-fuchsia-600" };
}

export function humidityComfort(humidity: number): string {
  if (humidity < 30) return "Dry";
  if (humidity < 60) return "Comfortable";
  if (humidity < 75) return "Humid";
  return "Very humid";
}
