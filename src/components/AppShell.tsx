import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, LayoutDashboard, User, BookHeart, Mail, Images, Settings, Menu, X, Play, Pause, Music2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useMusic } from "@/lib/music";
import { useProfile } from "@/lib/store";

const NAV = [
  { to: "/", label: "Beranda", icon: Heart },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profil", icon: User },
  { to: "/bio", label: "Bio", icon: BookHeart },
  { to: "/kisah", label: "Kisah", icon: Images },
  { to: "/surat", label: "Surat", icon: Mail },
  { to: "/admin", label: "Admin", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile } = useProfile();
  const music = useMusic();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Heart className="w-7 h-7 text-primary animate-heart-beat" fill="currentColor" />
            </div>
            <div className="leading-tight">
              <div className="font-script text-xl text-gradient">
                {profile.name1} & {profile.name2}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
                Forever · Selamanya
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <n.icon className="w-4 h-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <MusicButton />
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2 rounded-full hover:bg-muted"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t bg-card/95 backdrop-blur animate-fade-in">
            <div className="p-3 grid grid-cols-2 gap-2">
              {NAV.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted/50"
                    }`}
                  >
                    <n.icon className="w-4 h-4" />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {music.needsGesture && music.hasTrack && (
        <button
          onClick={music.toggle}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-glow flex items-center gap-2 animate-pulse-glow animate-scale-in"
        >
          <Music2 className="w-4 h-4" />
          <span className="text-sm font-medium">Putar musik</span>
        </button>
      )}

      <main className="flex-1">{children}</main>

      <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Heart className="w-4 h-4 text-primary" fill="currentColor" />
          <span className="font-script text-lg text-gradient">
            {profile.name1} & {profile.name2}
          </span>
        </div>
        <p>Dibuat dengan cinta · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function MusicButton() {
  const { hasTrack, playing, toggle, trackName } = useMusic();
  if (!hasTrack) {
    return (
      <Link
        to="/admin"
        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-xs bg-muted/70 text-muted-foreground hover:bg-muted"
        title="Upload musik di halaman Admin"
      >
        <Music2 className="w-4 h-4" />
        Musik
      </Link>
    );
  }
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition max-w-[180px]"
      title={trackName}
    >
      {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      <span className="text-xs font-medium truncate hidden sm:inline">{trackName || "Musik"}</span>
    </button>
  );
}
