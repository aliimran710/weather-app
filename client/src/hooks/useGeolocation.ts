import * as React from "react";

export type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable";

export interface Coords {
  lat: number;
  lon: number;
}

interface GeolocationHook {
  status: GeoStatus;
  coords: Coords | null;
  request: () => void;
}

/*
  Wraps the browser Geolocation API.

  Decision point — denied-permission behavior: here, a denial simply flips
  `status` to "denied" and the UI reveals the city search. We deliberately do
  NOT auto-retry or nag; the browser remembers a block, so re-prompting is both
  futile and annoying. (Swap in a gentle retry here if you'd prefer that UX.)
*/
export function useGeolocation(): GeolocationHook {
  const [status, setStatus] = React.useState<GeoStatus>("idle");
  const [coords, setCoords] = React.useState<Coords | null>(null);

  // If the browser already knows permission is denied, surface the fallback
  // immediately instead of showing a prompt that will never appear.
  React.useEffect(() => {
    if (!("permissions" in navigator)) return;
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (result.state === "denied") setStatus("denied");
      })
      .catch(() => {
        /* permissions query unsupported — ignore */
      });
  }, []);

  const request = React.useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  return { status, coords, request };
}
