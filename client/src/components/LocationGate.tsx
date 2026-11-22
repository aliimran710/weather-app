import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Search, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchCity, type Place } from "@/api/geocode";
import type { GeoStatus } from "@/hooks/useGeolocation";

interface Props {
  status: GeoStatus;
  onRequest: () => void;
  onPickPlace: (place: Place) => void;
}

/*
  The entry experience. Leads with the native geolocation prompt, and always
  offers a city search as a fallback — so the app works even if location is
  denied or unavailable.
*/
export function LocationGate({ status, onRequest, onPickPlace }: Props) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Place[]>([]);
  const [searching, setSearching] = React.useState(false);

  const denied = status === "denied" || status === "unavailable";
  const prompting = status === "prompting";

  // Debounced forward search.
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchCity(q, controller.signal));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <section className="flex min-h-[88vh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl"
      >
        <p className="eyebrow mb-4">Live local forecast</p>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-6xl">
          Your sky,
          <br />
          in full detail.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-balance text-base text-fg/70 sm:text-lg">
          Allow location to see the weather exactly where you are — temperature,
          wind, air quality, and the week ahead.
        </p>

        <div className="mt-9 flex flex-col items-center gap-4">
          {!denied && (
            <Button
              variant="sun"
              size="lg"
              onClick={onRequest}
              disabled={prompting}
              className="w-full max-w-xs"
            >
              {prompting ? (
                <>
                  <Loader2 className="animate-spin" /> Waiting for permission…
                </>
              ) : (
                <>
                  <LocateFixed /> Use my location
                </>
              )}
            </Button>
          )}

          {denied && (
            <p className="flex items-center gap-2 rounded-full bg-white/40 px-4 py-2 text-sm text-fg/70">
              <MapPin className="size-4 text-accent" />
              Location is off — search for a city instead.
            </p>
          )}

          {/* City search */}
          <div className="relative w-full max-w-sm">
            <div className="glass flex items-center gap-2 px-4 py-2.5">
              <Search className="size-4 shrink-0 text-accent/70" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a city…"
                aria-label="Search for a city"
                className="w-full bg-transparent text-sm text-fg placeholder:text-fg/40 focus:outline-none"
              />
              {searching && (
                <Loader2 className="size-4 shrink-0 animate-spin text-accent/70" />
              )}
            </div>

            {results.length > 0 && (
              <ul className="glass-strong absolute z-20 mt-2 w-full overflow-hidden p-1.5 text-left">
                {results.map((p, i) => (
                  <li key={`${p.latitude}-${p.longitude}-${i}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onPickPlace(p);
                        setQuery("");
                        setResults([]);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/50 focus-visible:bg-white/50 focus-visible:outline-none"
                    >
                      <MapPin className="size-4 shrink-0 text-accent/70" />
                      <span className="truncate">
                        <span className="font-medium text-fg">{p.name}</span>
                        <span className="text-fg/55">
                          {[p.admin, p.country].filter(Boolean).join(", ")
                            ? `, ${[p.admin, p.country].filter(Boolean).join(", ")}`
                            : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
