import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Calendar, Sparkles, ArrowRight, LayoutDashboard, Mail } from "lucide-react";
import { useProfile, daysBetween } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Selamanya · Beranda" },
      { name: "description", content: "Selamat datang di portfolio cinta kami. Dua jiwa, satu cerita abadi." },
    ],
  }),
  component: Home,
});

function Home() {
  const { profile } = useProfile();
  const days = daysBetween(profile.anniversary);

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Portfolio Cinta
          </div>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-[1.05] mb-4">
            <span className="font-script text-gradient block text-6xl sm:text-8xl md:text-9xl mb-2">
              {profile.name1}
            </span>
            <span className="text-foreground/60 text-3xl sm:text-5xl font-display italic">&</span>
            <span className="font-script text-gradient block text-6xl sm:text-8xl md:text-9xl mt-2">
              {profile.name2}
            </span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-muted-foreground italic max-w-xl mx-auto">
            "{profile.quote}"
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-glow hover:opacity-90 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Lihat Dashboard
            </Link>
            <Link
              to="/surat"
              className="px-6 py-3 rounded-full glass text-foreground font-medium flex items-center gap-2 hover:bg-card"
            >
              <Mail className="w-4 h-4" />
              Baca Surat Cinta
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Anniversary big card */}
        <div className="mt-16 max-w-3xl mx-auto glass rounded-3xl p-8 sm:p-12 text-center shadow-soft animate-scale-in">
          <div className="flex items-center justify-center gap-2 text-primary mb-3">
            <Calendar className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">Sudah Bersama</span>
          </div>
          <div className="font-display text-6xl sm:text-8xl text-gradient font-bold">
            {days.toLocaleString("id-ID")}
          </div>
          <div className="mt-2 text-lg text-muted-foreground">hari · {(days / 365).toFixed(2)} tahun</div>
          <div className="mt-4 text-sm text-muted-foreground">Sejak {formatDate(profile.anniversary)}</div>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: "/profile", title: "Profil Kami", desc: "Foto & identitas kami berdua", icon: Heart },
            { to: "/bio", title: "Bio Lengkap", desc: "Kisah singkat tentang diri kami", icon: Sparkles },
            { to: "/kisah", title: "Timeline Kisah", desc: "Momen-momen berharga sepanjang jalan", icon: Calendar },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group glass rounded-2xl p-6 hover:shadow-glow transition-all hover:-translate-y-1"
            >
              <c.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-display text-xl mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-3 text-primary text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Buka <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}
