const REVERSE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const SEARCH_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface Place {
  name: string;
  admin?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<string> {
  try {
    const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon), localityLanguage: "en" });
    const res = await fetch(`${REVERSE_URL}?${params}`, { signal });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const city = data?.city || data?.locality || data?.principalSubdivision || "Your location";
    const region = data.principalSubdivision;
    const country = data?.countryName;
    return [city, region && region !== city ? region : null, country].filter(Boolean).join(", ");
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

export async function searchCity(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({ name: q, count: "6", language: "en", format: "json" });
  const res = await fetch(`${SEARCH_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`Search returned ${res.status}`);
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({ 
    name: r.name, admin: r.admin1, country: r.country, latitude: r.latitude, longitude: r.longitude,
  }));
}
