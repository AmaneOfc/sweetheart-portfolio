import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { Mail, Heart } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/surat")({
  head: () => ({
    meta: [
      { title: "Kotak Surat · Selamanya" },
      { name: "description", content: "Kumpulan surat cinta antar pasangan." },
    ],
  }),
  component: Surat,
});

function Surat() {
  const { profile } = useProfile();
  const [open, setOpen] = useState<string | null>(null);
  const letters = [...profile.letters].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-10 animate-fade-in text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
          <Mail className="w-3.5 h-3.5" /> Kotak Surat
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-3">Surat-Surat Cinta</h1>
      </header>

      {letters.length === 0 && (
        <div className="text-center text-muted-foreground py-20">Belum ada surat. Tambahkan dari halaman Admin.</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {letters.map((l) => (
          <button
            key={l.id}
            onClick={() => setOpen(l.id)}
            className="text-left glass rounded-2xl p-6 shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-semibold">
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
              Dari {l.from} untuk {l.to}
            </div>
            <h3 className="font-display text-2xl mt-2">{l.title}</h3>
            <p className="mt-2 text-muted-foreground line-clamp-3">{l.body}</p>
            <div className="mt-3 text-xs text-muted-foreground">{fmt(l.date)}</div>
          </button>
        ))}
      </div>

      {open && (() => {
        const l = letters.find((x) => x.id === open)!;
        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setOpen(null)}
          >
            <div
              className="max-w-lg w-full bg-card rounded-3xl p-8 shadow-glow animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-primary text-xs uppercase tracking-widest font-semibold">
                Dari {l.from} untuk {l.to}
              </div>
              <h3 className="font-display text-3xl mt-2 text-gradient">{l.title}</h3>
              <p className="mt-4 whitespace-pre-line leading-relaxed">{l.body}</p>
              <div className="mt-4 text-xs text-muted-foreground">{fmt(l.date)}</div>
              <button
                onClick={() => setOpen(null)}
                className="mt-6 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        );
      })()}
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
