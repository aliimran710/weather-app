/*
  Open-Meteo forecast client. Free, no API key, CORS-friendly — which is exactly
  why it suits a keyless frontend. Everything is fetched in metric and converted
  for display elsewhere.
*/

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export interface CurrentWeather {
  time: string;
  isDay: boolean;
  temperature: number; // °C
  apparentTemperature: number; // °C
  humidity: number; // %
  precipitation: number; // mm
  weatherCode: number;
  cloudCover: number; // %
  pressure: number; // hPa (surface)
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGusts: number; // km/h
  visibility: number | null; // meters
  uvIndex: number | null;
  dewPoint: number | null; // °C
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyPoint {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
}

export async function fetchWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "surface_pressure",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "weather_code",
      "is_day",
      "visibility",
      "uv_index",
      "dew_point_2m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const res = await fetch(`${FORECAST_URL}?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`Weather service returned ${res.status}`);
  }
  const raw = await res.json();
  return normalize(raw, lat, lon);
}

function normalize(raw: any, lat: number, lon: number): WeatherData {
  const c = raw.current ?? {};
  const h = raw.hourly ?? {};
  const d = raw.daily ?? {};

  // Index into the hourly series for values Open-Meteo only exposes hourly
  // (visibility / uv / dew point) at the current hour.
  const hourIndex = currentHourIndex(h.time ?? [], c.time);

  const current: CurrentWeather = {
    time: c.time,
    isDay: c.is_day === 1,
    temperature: c.temperature_2m,
    apparentTemperature: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    precipitation: c.precipitation,
    weatherCode: c.weather_code,
    cloudCover: c.cloud_cover,
    pressure: c.surface_pressure,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    windGusts: c.wind_gusts_10m,
    visibility: pick(h.visibility, hourIndex),
    uvIndex: pick(h.uv_index, hourIndex),
    dewPoint: pick(h.dew_point_2m, hourIndex),
  };

  // Next 24 hours, starting at the current hour.
  const startIndex = Math.max(hourIndex, 0);
  const hourly: HourlyPoint[] = [];
  const times: string[] = h.time ?? [];
  for (let i = startIndex; i < times.length && hourly.length < 24; i++) {
    hourly.push({
      time: times[i],
      temperature: h.temperature_2m[i],
      apparentTemperature: h.apparent_temperature[i],
      precipitationProbability: h.precipitation_probability?.[i] ?? 0,
      weatherCode: h.weather_code[i],
      isDay: h.is_day?.[i] === 1,
    });
  }

  const daily: DailyPoint[] = (d.time ?? []).map((date: string, i: number) => ({
    date,
    weatherCode: d.weather_code[i],
    tempMax: d.temperature_2m_max[i],
    tempMin: d.temperature_2m_min[i],
    sunrise: d.sunrise[i],
    sunset: d.sunset[i],
    uvIndexMax: d.uv_index_max?.[i] ?? 0,
    precipitationProbabilityMax: d.precipitation_probability_max?.[i] ?? 0,
    windSpeedMax: d.wind_speed_10m_max?.[i] ?? 0,
  }));

  return {
    latitude: raw.latitude ?? lat,
    longitude: raw.longitude ?? lon,
    timezone: raw.timezone ?? "auto",
    current,
    hourly,
    daily,
  };
}

function pick(arr: number[] | undefined, i: number): number | null {
  if (!arr || i < 0 || i >= arr.length) return null;
  const v = arr[i];
  return v == null ? null : v;
}

/** Find the hourly slot matching the current hour; fall back to 0. */
function currentHourIndex(times: string[], currentTime?: string): number {
  if (!times.length || !currentTime) return 0;
  const target = currentTime.slice(0, 13); // "YYYY-MM-DDTHH"
  const exact = times.findIndex((t) => t.slice(0, 13) === target);
  if (exact >= 0) return exact;
  // Otherwise, first slot at or after "now".
  const after = times.findIndex((t) => t >= currentTime);
  return after >= 0 ? after : 0;
}
