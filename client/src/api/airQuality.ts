/* Open-Meteo Air Quality API — also keyless. */

const AQI_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export interface AirQuality {
  europeanAqi: number | null;
  usAqi: number | null;
  pm25: number | null;
  pm10: number | null;
}

export async function fetchAirQuality(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: ["european_aqi", "us_aqi", "pm2_5", "pm10"].join(","),
    timezone: "auto",
  });

  const res = await fetch(`${AQI_URL}?${params}`, { signal });
  if (!res.ok) {
    throw new Error(`Air-quality service returned ${res.status}`);
  }
  const raw = await res.json();
  const c = raw.current ?? {};
  return {
    europeanAqi: c.european_aqi ?? null,
    usAqi: c.us_aqi ?? null,
    pm25: c.pm2_5 ?? null,
    pm10: c.pm10 ?? null,
  };
}
