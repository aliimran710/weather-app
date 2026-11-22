import * as React from "react";
import type { TempUnit, WindUnit } from "@/lib/format";

interface UnitsState {
  tempUnit: TempUnit;
  windUnit: WindUnit;
  toggleTemp: () => void;
  toggleWind: () => void;
}

const UnitsContext = React.createContext<UnitsState | null>(null);

const STORAGE_KEY = "skyline:units";

function loadInitial(): { tempUnit: TempUnit; windUnit: WindUnit } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore unavailable/corrupt storage */
  }
  return { tempUnit: "c", windUnit: "kmh" };
}

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [tempUnit, setTempUnit] = React.useState<TempUnit>(
    () => loadInitial().tempUnit
  );
  const [windUnit, setWindUnit] = React.useState<WindUnit>(
    () => loadInitial().windUnit
  );

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tempUnit, windUnit }));
    } catch {
      /* storage may be blocked; the toggle still works in-session */
    }
  }, [tempUnit, windUnit]);

  const value = React.useMemo<UnitsState>(
    () => ({
      tempUnit,
      windUnit,
      toggleTemp: () => setTempUnit((u) => (u === "c" ? "f" : "c")),
      toggleWind: () => setWindUnit((u) => (u === "kmh" ? "mph" : "kmh")),
    }),
    [tempUnit, windUnit]
  );

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits(): UnitsState {
  const ctx = React.useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits must be used within <UnitsProvider>");
  return ctx;
}
