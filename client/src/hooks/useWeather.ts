import { useQuery } from "@tanstack/react-query";
import { fetchWeather } from "@/api/weather";
import { fetchAirQuality } from "@/api/airQuality";

export interface ActiveLocation {
  lat: number;
  lon: number;
  place: string;
}

export function useWeather(location: ActiveLocation | null) {
  const weather = useQuery({
    queryKey: ["weather", location?.lat, location?.lon],
    queryFn: ({ signal }) => fetchWeather(location!.lat, location!.lon, signal),
    enabled: !!location,
  });

  const airQuality = useQuery({
    queryKey: ["air-quality", location?.lat, location?.lon],
    queryFn: ({ signal }) =>
      fetchAirQuality(location!.lat, location!.lon, signal),
    enabled: !!location,
  });

  return { weather, airQuality };
}
