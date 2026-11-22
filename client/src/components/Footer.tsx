import { CloudSun, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-5xl px-6 pb-12 pt-6">
      <div className="glass flex flex-col gap-4 p-6 text-sm text-fg/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CloudSun className="size-5 text-accent" />
          <span>
            <span className="font-display font-semibold text-fg">Skyline</span>{" "}
            — weather &amp; air quality by{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              Open-Meteo
            </a>
            .
          </span>
        </div>

        {/* Honest disclosure — kept by default (see plan). */}
        <p className="flex items-start gap-2 text-xs text-fg/55 sm:max-w-sm">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent/70" />
          Your location is used to fetch your local forecast and is recorded by
          the site owner. It is never sold or shared with advertisers.
        </p>
      </div>
    </footer>
  );
}
