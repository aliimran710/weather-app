import * as React from "react";

interface TiltProps {
  ref: React.RefObject<HTMLDivElement>;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  style: React.CSSProperties;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/*
  3D pointer tilt for glass cards. Maps the pointer's offset from the card's
  center onto rotateX / rotateY, within +/- `max` degrees. Disabled entirely
  when the viewer prefers reduced motion (returns inert handlers).
*/
export function usePointerTilt(max = 9): TiltProps {
  const ref = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0 });
  const reduced = React.useMemo(prefersReducedMotion, []);

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      setTilt({
        rx: (0.5 - py) * max * 2,
        ry: (px - 0.5) * max * 2,
      });
    },
    [max, reduced]
  );

  const onPointerLeave = React.useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
  }, []);

  const style: React.CSSProperties = reduced
    ? {}
    : {
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      };

  return { ref, onPointerMove, onPointerLeave, style };
}
