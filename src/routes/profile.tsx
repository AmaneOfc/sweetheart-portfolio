import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "@/lib/store";
import { Heart, User } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil · Selamanya" },
      { name: "description", content: "Profil pasangan dengan foto dan identitas." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { profile } = useProfile();
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-10 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary font-semibold">Profil</div>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Kami Berdua</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <PersonCard name={profile.name1} bio={profile.bio1} birthday={profile.birthday1} photo={profile.photo1} />
        <PersonCard name={profile.name2} bio={profile.bio2} birthday={profile.birthday2} photo={profile.photo2} />
      </div>

      <div className="mt-10 glass rounded-3xl p-8 text-center shadow-soft">
        <Heart className="w-8 h-8 text-primary mx-auto mb-3 animate-heart-beat" fill="currentColor" />
        <p className="font-script text-3xl text-gradient">"{profile.quote}"</p>
      </div>
    </div>
  );
}

function PersonCard({
  name,
  bio,
  birthday,
  photo,
}: {
  name: string;
  bio: string;
  birthday: string;
  photo?: string;
}) {
  return (
    <div className="glass rounded-3xl overflow-hidden shadow-soft animate-scale-in">
      <div className="aspect-[4/5] bg-gradient-love relative">
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/80">
            <User className="w-24 h-24" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="font-script text-4xl drop-shadow">{name}</div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-muted-foreground italic">"{bio}"</p>
        <div className="mt-3 text-sm">
          <span className="text-muted-foreground">Lahir: </span>
          <span className="font-medium">{formatDate(birthday)}</span>
        </div>
      </div>
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
