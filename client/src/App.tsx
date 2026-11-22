import * as React from "react";
import { toast } from "sonner";
import { CloudSun, Loader2, RefreshCw, MapPin } from "lucide-react";
import { UnitsProvider } from "@/hooks/useUnits";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather, type ActiveLocation } from "@/hooks/useWeather";
import { reverseGeocode, type Place } from "@/api/geocode";
import { notifyOwner } from "@/api/notify";
import { getWeatherInfo } from "@/lib/weatherCodes";
import { SkyBackground } from "@/components/SkyBackground";
import { LocationGate } from "@/components/LocationGate";
import { Hero } from "@/components/Hero";
import { CurrentDetails } from "@/components/CurrentDetails";
import { HourlyForecast } from "@/components/HourlyForecast";
import { DailyForecast } from "@/components/DailyForecast";
import { AirQuality } from "@/components/AirQuality";
import { Footer } from "@/components/Footer";
import { UnitToggle } from "@/components/UnitToggle";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <UnitsProvider>
      <AppInner />
    </UnitsProvider>
  );
}

function AppInner() {
  const [location, setLocation] = React.useState<ActiveLocation | null>(null);
  const { status, coords, request } = useGeolocation();
  const { weather, airQuality } = useWeather(location);

  // Granted geolocation → resolve a place name, then set + notify.
  React.useEffect(() => {
    if (!coords) return;
    let active = true;
    (async () => {
      const place = await reverseGeocode(coords.lat, coords.lon);
      if (!active) return;
      setLocation({ lat: coords.lat, lon: coords.lon, place });
      notifyOwner({
        lat: coords.lat,
        lon: coords.lon,
        place,
        source: "geolocation",
      });
    })();
    return () => {
      active = false;
    };
  }, [coords]);

  // Surface fetch failures as a toast (in addition to the inline retry state).
  React.useEffect(() => {
    if (weather.isError) {
      toast.error("Couldn't load the forecast", {
        description: "Check your connection and try again.",
      });
    }
  }, [weather.isError]);

  const handlePickPlace = (p: Place) => {
    const place = [p.name, p.admin, p.country].filter(Boolean).join(", ");
    setLocation({ lat: p.latitude, lon: p.longitude, place });
    notifyOwner({ lat: p.latitude, lon: p.longitude, place, source: "search" });
  };

  const data = weather.data;
  const sceneInfo = data ? getWeatherInfo(data.current.weatherCode) : null;
  const scene = sceneInfo?.scene ?? "clear";
  const isDay = data ? data.current.isDay : true;

  // Flip the whole UI to the night token set when it's night at the location.
  React.useEffect(() => {
    const night = !!data && !isDay;
    document.documentElement.classList.toggle("theme-night", night);
    return () => document.documentElement.classList.remove("theme-night");
  }, [data, isDay]);

  return (
    <>
      <SkyBackground scene={scene} isDay={isDay} />

      <Header
        showToggle={!!data}
        showChange={!!location}
        onChange={() => setLocation(null)}
      />

      <main>
        {!location && (
          <LocationGate
            status={status}
            onRequest={request}
            onPickPlace={handlePickPlace}
          />
        )}

        {location && weather.isLoading && <LoadingState place={location.place} />}

        {location && weather.isError && (
          <ErrorState
            onRetry={() => {
              weather.refetch();
              airQuality.refetch();
            }}
          />
        )}

        {location && data && (
          <>
            <Hero place={location.place} current={data.current} today={data.daily[0]} />
            <CurrentDetails current={data.current} today={data.daily[0]} />
            <HourlyForecast hourly={data.hourly} />
            <DailyForecast daily={data.daily} />
            {airQuality.data && <AirQuality data={airQuality.data} />}
            <Footer />
          </>
        )}
      </main>
    </>
  );
}

function Header({
  showToggle,
  showChange,
  onChange,
}: {
  showToggle: boolean;
  showChange: boolean;
  onChange: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <CloudSun className="size-6 text-accent" />
          <span className="font-display text-lg font-bold tracking-tight text-fg">
            Skyline
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showChange && (
            <Button variant="glass" size="sm" onClick={onChange}>
              <MapPin className="size-3.5" /> Change
            </Button>
          )}
          {showToggle && <UnitToggle />}
        </div>
      </div>
    </header>
  );
}

function LoadingState({ place }: { place: string }) {
  return (
    <section className="flex min-h-[92vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="size-10 animate-spin text-accent" />
      <p className="font-display text-xl font-semibold text-fg">
        Reading the sky over {place}…
      </p>
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="flex min-h-[92vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="glass max-w-sm p-8">
        <p className="font-display text-xl font-bold text-fg">
          The forecast didn't load
        </p>
        <p className="mt-2 text-sm text-fg/65">
          The weather service couldn't be reached. This is usually a connection
          hiccup.
        </p>
        <Button variant="default" className="mt-6" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      </div>
    </section>
  );
}
