import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";

export function Preloader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let p = 0;
    const iv = window.setInterval(() => {
      p = Math.min(100, p + Math.random() * 14 + 6);
      setProgress(p);
      if (p >= 100) {
        window.clearInterval(iv);
        window.setTimeout(() => setGone(true), 500);
        window.setTimeout(onDone, 1100);
      }
    }, 180);
    return () => window.clearInterval(iv);
  }, [onDone]);

  const hearts = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        left: Math.random() * 100,
        size: 12 + Math.random() * 28,
        delay: Math.random() * 3,
        dur: 4 + Math.random() * 5,
        opacity: 0.35 + Math.random() * 0.55,
      })),
    [],
  );

  return (
    <div
      className={`fixed inset-0 z-[100] bg-gradient-love overflow-hidden transition-opacity duration-700 ${
        gone ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={gone}
    >
      {/* Falling hearts full-screen */}
      <div className="absolute inset-0 overflow-hidden">
        {hearts.map((h, i) => (
          <Heart
            key={i}
            className="absolute text-white drop-shadow-lg animate-fall"
            fill="currentColor"
            style={{
              left: `${h.left}%`,
              top: "-10vh",
              width: h.size,
              height: h.size,
              opacity: h.opacity,
              animationDuration: `${h.dur}s`,
              animationDelay: `${h.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-white">
        <div className="flex items-center gap-4 mb-6">
          <Heart className="w-16 h-16 sm:w-20 sm:h-20 animate-heart-beat drop-shadow-2xl" fill="currentColor" />
        </div>
        <h1 className="font-script text-5xl sm:text-7xl mb-2 drop-shadow-lg">Selamanya</h1>
        <p className="font-display italic text-lg sm:text-xl opacity-90 mb-10 text-center max-w-md">
          "Dua jiwa, satu cerita abadi"
        </p>
        <div className="w-72 sm:w-96 max-w-[80vw] h-1.5 bg-white/25 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-sm tracking-widest uppercase opacity-80">{Math.floor(progress)}%</div>
      </div>
    </div>
  );
}
