import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/kisah")({
  head: () => ({
    meta: [
      { title: "Kisah Kita · Selamanya" },
      { name: "description", content: "Timeline momen-momen berharga sepanjang perjalanan cinta." },
    ],
  }),
  component: Kisah,
});

function Kisah() {
  const { profile } = useProfile();
  const items = [...profile.milestones].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-10 animate-fade-in text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
          <Heart className="w-3.5 h-3.5" fill="currentColor" /> Timeline
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-3">Kisah Kita</h1>
        <p className="text-muted-foreground mt-2">Setiap momen adalah bab dari cerita panjang kita.</p>
      </header>

      {profile.gallery.length > 0 && (
        <section className="mb-12 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {profile.gallery.map((src, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden glass shadow-soft">
              <img src={src} alt={`Kenangan ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition" />
            </div>
          ))}
        </section>
      )}

      <div className="relative">
        <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-primary/30 sm:-translate-x-1/2" />
        <ol className="space-y-8">
          {items.map((m, i) => (
            <li
              key={m.id}
              className={`relative pl-12 sm:pl-0 sm:grid sm:grid-cols-2 sm:gap-8 animate-fade-in ${
                i % 2 === 0 ? "" : "sm:[direction:rtl]"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`sm:[direction:ltr] ${i % 2 === 0 ? "sm:text-right sm:pr-8" : "sm:pl-8"}`}>
                <div className="glass rounded-2xl p-5 shadow-soft inline-block text-left">
                  <div className="text-xs uppercase tracking-widest text-primary font-semibold">
                    {fmt(m.date)}
                  </div>
                  <h3 className="font-display text-2xl mt-1">{m.title}</h3>
                  <p className="text-muted-foreground mt-2">{m.description}</p>
                </div>
              </div>
              <div className="hidden sm:block" />
              <div className="absolute left-4 sm:left-1/2 top-6 -translate-x-1/2 w-4 h-4 rounded-full bg-primary shadow-glow border-4 border-background" />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function fmt(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}
