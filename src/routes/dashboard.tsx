import { createFileRoute } from "@tanstack/react-router";
import { useProfile, daysBetween } from "@/lib/store";
import { Heart, Calendar, Cake, Clock, Mail, Images } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Selamanya" },
      { name: "description", content: "Statistik hubungan: hari bersama, jam, menit, dan momen." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useProfile();
  const days = daysBetween(profile.anniversary);
  const hours = days * 24;
  const minutes = hours * 60;
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);

  const daysToBday1 = daysUntilNext(profile.birthday1);
  const daysToBday2 = daysUntilNext(profile.birthday2);
  const daysToAnn = daysUntilNext(profile.anniversary);

  const stats = [
    { label: "Hari", value: days.toLocaleString("id-ID"), icon: Calendar },
    { label: "Minggu", value: weeks.toLocaleString("id-ID"), icon: Calendar },
    { label: "Bulan", value: months.toLocaleString("id-ID"), icon: Calendar },
    { label: "Jam", value: hours.toLocaleString("id-ID"), icon: Clock },
    { label: "Menit", value: minutes.toLocaleString("id-ID"), icon: Clock },
    { label: "Detak Cinta", value: (minutes * 72).toLocaleString("id-ID"), icon: Heart },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-10 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary font-semibold">Dashboard</div>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Statistik Cinta Kami</h1>
        <p className="text-muted-foreground mt-2">Semua angka tentang perjalanan {profile.name1} & {profile.name2}.</p>
      </header>

      <section className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-5 text-center animate-scale-in shadow-soft"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-display text-2xl sm:text-3xl text-gradient font-bold leading-none">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <CountdownCard title={`Ulang tahun ${profile.name1}`} days={daysToBday1} icon={Cake} />
        <CountdownCard title={`Ulang tahun ${profile.name2}`} days={daysToBday2} icon={Cake} />
        <CountdownCard title="Anniversary" days={daysToAnn} icon={Heart} />
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <MiniCard label="Momen di Timeline" value={profile.milestones.length} icon={Images} />
        <MiniCard label="Surat Cinta" value={profile.letters.length} icon={Mail} />
        <MiniCard label="Foto Galeri" value={profile.gallery.length} icon={Images} />
      </section>
    </div>
  );
}

function CountdownCard({ title, days, icon: Icon }: { title: string; days: number; icon: any }) {
  return (
    <div className="glass rounded-2xl p-6 flex items-center gap-4 shadow-soft animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="font-display text-2xl">
          {days === 0 ? (
            <span className="text-gradient">Hari ini! 🎉</span>
          ) : (
            <>
              <span className="text-gradient font-bold">{days}</span>{" "}
              <span className="text-base text-muted-foreground">hari lagi</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="glass rounded-2xl p-6 flex items-center gap-4">
      <Icon className="w-8 h-8 text-primary" />
      <div>
        <div className="font-display text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function daysUntilNext(dateStr: string): number {
  if (!dateStr) return 0;
  const now = new Date();
  const d = new Date(dateStr);
  const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
    next.setFullYear(now.getFullYear() + 1);
  }
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
