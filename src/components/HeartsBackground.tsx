import { useMemo } from "react";
import { Heart } from "lucide-react";

export function HeartsBackground() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }).map(() => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 22,
        delay: Math.random() * 8,
        dur: 10 + Math.random() * 14,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-hero">
      {hearts.map((h, i) => (
        <Heart
          key={i}
          className="absolute text-primary animate-float-up"
          fill="currentColor"
          style={{
            left: `${h.left}%`,
            bottom: "-8vh",
            width: h.size,
            height: h.size,
            opacity: h.opacity,
            animationDuration: `${h.dur}s`,
            animationDelay: `${h.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
