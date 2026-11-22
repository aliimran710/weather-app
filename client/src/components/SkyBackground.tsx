import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import type { SkyScene } from "@/lib/weatherCodes";

/*
  The signature element: a fixed, full-viewport sky that renders the viewer's
  ACTUAL conditions and time of day. Scene + is-day pick the gradient and which
  atmospheric layers (sun / moon / stars / clouds / rain / snow) are drawn.
  Scroll drives gentle multi-speed parallax so the page feels dimensional.
*/

type Gradient = { from: string; via: string; to: string };

const DAY: Record<SkyScene, Gradient> = {
  clear: { from: "#2E8BE6", via: "#6FB7F5", to: "#CDE8FF" },
  partly: { from: "#4A9BE8", via: "#8FC4F2", to: "#E3F2FF" },
  cloudy: { from: "#7FA7C4", via: "#AEC8DC", to: "#E8F1F7" },
  fog: { from: "#AEC0CC", via: "#CFD9E0", to: "#EEF3F6" },
  rain: { from: "#4C6F8E", via: "#7D9AB2", to: "#C6D6E2" },
  snow: { from: "#9FB8CE", via: "#CBDDEC", to: "#F2F8FF" },
  storm: { from: "#2E4258", via: "#52708A", to: "#9FB4C6" },
};

const NIGHT: Record<SkyScene, Gradient> = {
  clear: { from: "#071A3A", via: "#0B2A54", to: "#15406E" },
  partly: { from: "#0A1E40", via: "#122F58", to: "#1C4570" },
  cloudy: { from: "#10203A", via: "#24354F", to: "#3C4F66" },
  fog: { from: "#1A2634", via: "#2C3A49", to: "#44525F" },
  rain: { from: "#0C1B2E", via: "#1E3147", to: "#38506A" },
  snow: { from: "#15233C", via: "#2B3E59", to: "#4A6180" },
  storm: { from: "#060D1A", via: "#16293E", to: "#2C4258" },
};

const CLOUD_COUNT: Record<SkyScene, number> = {
  clear: 2,
  partly: 4,
  cloudy: 6,
  fog: 5,
  rain: 6,
  snow: 4,
  storm: 7,
};

interface Props {
  scene: SkyScene;
  isDay: boolean;
}

export function SkyBackground({ scene, isDay }: Props) {
  const reduced = useReducedMotion();
  const palette = isDay ? DAY[scene] : NIGHT[scene];
  const showSun = isDay && (scene === "clear" || scene === "partly");
  const showMoon = !isDay && (scene === "clear" || scene === "partly" || scene === "cloudy");
  const showStars = !isDay && (scene === "clear" || scene === "partly");
  const showRain = scene === "rain" || scene === "storm";
  const showSnow = scene === "snow";

  const { scrollYProgress } = useScroll();
  const sunY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -140]);
  const cloudY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -70]);
  const farY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -36]);

  // Positions computed once; stable across re-renders.
  const stars = React.useMemo(() => makeStars(showStars ? 48 : 0), [showStars]);
  const clouds = React.useMemo(
    () => makeClouds(CLOUD_COUNT[scene]),
    [scene]
  );
  const drops = React.useMemo(
    () => makeDrops(showRain ? (scene === "storm" ? 90 : 60) : 0),
    [showRain, scene]
  );
  const flakes = React.useMemo(() => makeDrops(showSnow ? 50 : 0), [showSnow]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-[background] duration-1000"
      style={{
        background: `linear-gradient(180deg, ${palette.from} 0%, ${palette.via} 48%, ${palette.to} 100%)`,
      }}
    >
      {/* Atmospheric glow near the horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background: isDay
            ? "radial-gradient(60% 80% at 50% 120%, rgba(255,255,255,0.55), transparent 70%)"
            : "radial-gradient(60% 80% at 50% 120%, rgba(120,170,230,0.25), transparent 70%)",
        }}
      />

      {/* Stars (night, clear-ish) */}
      {stars.map((s, i) => (
        <motion.span
          key={`star-${i}`}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            y: farY,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Sun */}
      {showSun && (
        <motion.div
          className="absolute right-[10%] top-[12%]"
          style={{ y: sunY }}
        >
          <div className="relative">
            <div
              className="absolute -inset-16 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(255,214,107,0.65), transparent 65%)" }}
            />
            <div className="size-28 rounded-full bg-sun shadow-[0_0_80px_30px_rgba(255,200,87,0.55)] animate-sun-pulse sm:size-36" />
          </div>
        </motion.div>
      )}

      {/* Moon */}
      {showMoon && (
        <motion.div
          className="absolute right-[12%] top-[12%]"
          style={{ y: sunY }}
        >
          <div className="relative">
            <div
              className="absolute -inset-10 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, rgba(207,226,255,0.4), transparent 60%)" }}
            />
            <div className="size-24 rounded-full bg-sky-pale shadow-[0_0_60px_20px_rgba(207,226,255,0.35)] sm:size-28" />
          </div>
        </motion.div>
      )}

      {/* Drifting clouds */}
      {clouds.map((c, i) => (
        <motion.div
          key={`cloud-${i}`}
          className={c.fast ? "animate-drift-med" : "animate-drift-slow"}
          style={{
            position: "absolute",
            top: `${c.y}%`,
            y: c.fast ? cloudY : farY,
            opacity: c.opacity,
            animationDelay: `${c.delay}s`,
          }}
        >
          <Cloud width={c.width} tint={isDay ? "255,255,255" : "190,210,235"} />
        </motion.div>
      ))}

      {/* Rain */}
      {drops.map((d, i) => (
        <span
          key={`rain-${i}`}
          className="absolute top-0 animate-rain"
          style={{
            left: `${d.x}%`,
            width: 1.5,
            height: d.len,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(220,235,255,0.6))",
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}

      {/* Snow */}
      {flakes.map((f, i) => (
        <span
          key={`snow-${i}`}
          className="absolute top-0 animate-rain rounded-full bg-white/80"
          style={{
            left: `${f.x}%`,
            width: 5,
            height: 5,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.dur * 2.6}s`,
          }}
        />
      ))}
    </div>
  );
}

function Cloud({ width, tint }: { width: number; tint: string }) {
  // Soft blurred blob — reads as a cloud without an image asset.
  return (
    <div
      style={{
        width,
        height: width * 0.4,
        borderRadius: "999px",
        filter: "blur(6px)",
        background: `radial-gradient(60% 100% at 50% 65%, rgba(${tint},0.95), rgba(${tint},0.35) 70%, transparent 100%)`,
      }}
    />
  );
}

function makeStars(n: number) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
  }));
}

function makeClouds(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    y: Math.random() * 55 + 4,
    width: Math.random() * 180 + 120,
    opacity: Math.random() * 0.35 + 0.45,
    delay: -(Math.random() * 60),
    fast: i % 2 === 0,
  }));
}

function makeDrops(n: number) {
  return Array.from({ length: n }, () => ({
    x: Math.random() * 100,
    len: Math.random() * 40 + 40,
    delay: Math.random() * 2,
    dur: Math.random() * 0.6 + 0.7,
  }));
}
