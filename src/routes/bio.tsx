import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { BookHeart, Cake, Heart } from "lucide-react";

export const Route = createFileRoute("/bio")({
  head: () => ({
    meta: [
      { title: "Bio · Selamanya" },
      { name: "description", content: "Bio pasangan: tanggal lahir, tanggal jadian, dan kisah singkat." },
    ],
  }),
  component: Bio,
});

function Bio() {
  const { profile } = useProfile();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-10 animate-fade-in text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest">
          <BookHeart className="w-3.5 h-3.5" /> Bio
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-3">Tentang Kami</h1>
      </header>

      <div className="glass rounded-3xl p-8 sm:p-10 shadow-soft space-y-8 animate-scale-in">
        <Row label={`Bio ${profile.name1}`} value={profile.bio1} />
        <Row label={`Bio ${profile.name2}`} value={profile.bio2} />

        <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
          <Fact icon={Cake} label={`Ulang tahun ${profile.name1}`} value={fmt(profile.birthday1)} />
          <Fact icon={Cake} label={`Ulang tahun ${profile.name2}`} value={fmt(profile.birthday2)} />
          <Fact icon={Heart} label="Tanggal Jadian" value={fmt(profile.anniversary)} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">{label}</div>
      <p className="text-lg leading-relaxed">{value || <span className="text-muted-foreground italic">Belum diisi</span>}</p>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl p-4 bg-muted/40 text-center">
      <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-display text-lg mt-0.5">{value}</div>
    </div>
  );
}

function fmt(d: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}
