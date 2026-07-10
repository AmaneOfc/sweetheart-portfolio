import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useProfile, isAdmin, loginAdmin, logoutAdmin, fileToDataURL, changeAdminPasscode, adminLockRemainingMs, type BucinProfile } from "@/lib/store";
import { useMusic } from "@/lib/music";
import { Lock, LogOut, Save, Upload, Trash2, Plus, Music2, ImageIcon, KeyRound, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Selamanya" },
      { name: "description", content: "Panel admin untuk mengatur profil, bio, tanggal, musik, dan konten." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(isAdmin());
    const h = () => setAuthed(isAdmin());
    window.addEventListener("bucin:admin", h);
    return () => window.removeEventListener("bucin:admin", h);
  }, []);
  if (!authed) return <LoginGate />;
  return <AdminPanel />;
}

function LoginGate() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lockLeft, setLockLeft] = useState(0);

  useEffect(() => {
    const tick = () => setLockLeft(adminLockRemainingMs());
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  const locked = lockLeft > 0;

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass rounded-3xl p-8 shadow-soft animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="font-display text-3xl text-center">Admin Panel</h1>
        <p className="text-muted-foreground text-center text-sm mt-1">
          Masuk untuk mengubah profil, musik, dan konten.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy || locked) return;
            setBusy(true);
            const res = await loginAdmin(code);
            setBusy(false);
            if (res.ok) {
              setErr("");
              setCode("");
            } else {
              setErr(res.error ?? "Kode salah.");
            }
          }}
          className="mt-6 space-y-3"
        >
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Passcode admin"
              autoComplete="current-password"
              disabled={locked || busy}
              className="w-full rounded-full px-5 py-3 pr-12 bg-input/50 border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              aria-label={show ? "Sembunyikan" : "Tampilkan"}
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {locked && (
            <div className="text-destructive text-sm text-center">
              Terkunci. Coba lagi dalam {Math.ceil(lockLeft / 1000)} detik.
            </div>
          )}
          {!locked && err && <div className="text-destructive text-sm text-center">{err}</div>}
          <button
            disabled={locked || busy || !code}
            className="w-full rounded-full bg-primary text-primary-foreground py-3 font-medium disabled:opacity-60"
          >
            {busy ? "Memeriksa…" : "Masuk"}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            Passcode default (bisa diubah setelah login): <code className="bg-muted px-1.5 py-0.5 rounded">loveislove</code>
          </p>
        </form>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { profile, update } = useProfile();
  const [draft, setDraft] = useState<BucinProfile>(profile);
  const [saved, setSaved] = useState(false);
  const music = useMusic();

  useEffect(() => setDraft(profile), [profile]);

  const save = () => {
    update(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const set = <K extends keyof BucinProfile>(k: K, v: BucinProfile[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold">Admin</div>
          <h1 className="font-display text-4xl">Panel Pengaturan</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium flex items-center gap-2 shadow-soft"
          >
            <Save className="w-4 h-4" />
            {saved ? "Tersimpan!" : "Simpan Semua"}
          </button>
          <button
            onClick={logoutAdmin}
            className="rounded-full glass px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Nama Pasangan">
          <Field label="Nama 1">
            <input className={inputCls} value={draft.name1} onChange={(e) => set("name1", e.target.value)} />
          </Field>
          <Field label="Nama 2">
            <input className={inputCls} value={draft.name2} onChange={(e) => set("name2", e.target.value)} />
          </Field>
          <Field label="Kutipan / Quote">
            <input className={inputCls} value={draft.quote} onChange={(e) => set("quote", e.target.value)} />
          </Field>
        </Section>

        <Section title="Tanggal Penting">
          <Field label={`Tanggal lahir ${draft.name1}`}>
            <input type="date" className={inputCls} value={draft.birthday1} onChange={(e) => set("birthday1", e.target.value)} />
          </Field>
          <Field label={`Tanggal lahir ${draft.name2}`}>
            <input type="date" className={inputCls} value={draft.birthday2} onChange={(e) => set("birthday2", e.target.value)} />
          </Field>
          <Field label="Tanggal Jadian">
            <input type="date" className={inputCls} value={draft.anniversary} onChange={(e) => set("anniversary", e.target.value)} />
          </Field>
        </Section>

        <Section title={`Bio ${draft.name1}`}>
          <textarea className={inputCls + " min-h-[100px]"} value={draft.bio1} onChange={(e) => set("bio1", e.target.value)} />
          <PhotoPicker label="Foto" value={draft.photo1} onChange={(v) => set("photo1", v)} />
        </Section>

        <Section title={`Bio ${draft.name2}`}>
          <textarea className={inputCls + " min-h-[100px]"} value={draft.bio2} onChange={(e) => set("bio2", e.target.value)} />
          <PhotoPicker label="Foto" value={draft.photo2} onChange={(v) => set("photo2", v)} />
        </Section>

        <Section title="Musik Latar" className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Music2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="font-medium">{music.hasTrack ? music.trackName : "Belum ada musik"}</div>
              <div className="text-xs text-muted-foreground">
                Musik akan auto-play saat pengunjung membuka website. Tetap menyala meski di-refresh.
              </div>
            </div>
            <label className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" /> Upload MP3/audio
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) music.uploadTrack(f);
                }}
              />
            </label>
            {music.hasTrack && (
              <button
                onClick={() => music.clearTrack()}
                className="rounded-full bg-destructive/10 text-destructive px-4 py-2 text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Hapus
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-16">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={music.volume}
              onChange={(e) => music.setVolume(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm w-10 text-right">{Math.round(music.volume * 100)}%</span>
          </div>
        </Section>

        <Section title="Galeri Foto" className="lg:col-span-2">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {draft.gallery.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={src} className="w-full h-full object-cover" />
                <button
                  onClick={() => set("gallery", draft.gallery.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-primary/40 text-primary flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary/5">
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">Tambah</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  const urls = await Promise.all(files.map(fileToDataURL));
                  set("gallery", [...draft.gallery, ...urls]);
                }}
              />
            </label>
          </div>
        </Section>

        <Section title="Timeline Kisah" className="lg:col-span-2">
          <div className="space-y-3">
            {draft.milestones.map((m, i) => (
              <div key={m.id} className="grid gap-2 sm:grid-cols-[140px_1fr_2fr_auto] p-3 rounded-xl bg-muted/40">
                <input type="date" className={inputCls} value={m.date} onChange={(e) => updateItem("milestones", i, { date: e.target.value })} />
                <input className={inputCls} placeholder="Judul" value={m.title} onChange={(e) => updateItem("milestones", i, { title: e.target.value })} />
                <input className={inputCls} placeholder="Deskripsi" value={m.description} onChange={(e) => updateItem("milestones", i, { description: e.target.value })} />
                <button onClick={() => removeItem("milestones", i)} className="text-destructive p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button
              onClick={() =>
                set("milestones", [
                  ...draft.milestones,
                  { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), title: "", description: "" },
                ])
              }
              className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Momen
            </button>
          </div>
        </Section>

        <Section title="Surat Cinta" className="lg:col-span-2">
          <div className="space-y-4">
            {draft.letters.map((l, i) => (
              <div key={l.id} className="p-4 rounded-xl bg-muted/40 space-y-2">
                <div className="grid gap-2 sm:grid-cols-3">
                  <input className={inputCls} placeholder="Dari" value={l.from} onChange={(e) => updateItem("letters", i, { from: e.target.value })} />
                  <input className={inputCls} placeholder="Untuk" value={l.to} onChange={(e) => updateItem("letters", i, { to: e.target.value })} />
                  <input type="date" className={inputCls} value={l.date.slice(0, 10)} onChange={(e) => updateItem("letters", i, { date: new Date(e.target.value).toISOString() })} />
                </div>
                <input className={inputCls} placeholder="Judul" value={l.title} onChange={(e) => updateItem("letters", i, { title: e.target.value })} />
                <textarea className={inputCls + " min-h-[100px]"} placeholder="Isi surat…" value={l.body} onChange={(e) => updateItem("letters", i, { body: e.target.value })} />
                <div className="flex justify-end">
                  <button onClick={() => removeItem("letters", i)} className="text-destructive text-sm flex items-center gap-1"><Trash2 className="w-4 h-4" /> Hapus</button>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                set("letters", [
                  ...draft.letters,
                  {
                    id: crypto.randomUUID(),
                    from: draft.name1,
                    to: draft.name2,
                    title: "",
                    body: "",
                    date: new Date().toISOString(),
                  },
                ])
              }
              className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Tambah Surat
            </button>
          </div>
        </Section>

        <Section title="Keamanan · Ubah Passcode" className="lg:col-span-2">
          <ChangePasscodeForm />
        </Section>
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-center">
        <button
          onClick={save}
          className="rounded-full bg-primary text-primary-foreground px-8 py-3 font-medium shadow-glow flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saved ? "Tersimpan!" : "Simpan Semua Perubahan"}
        </button>
      </div>
    </div>
  );

  function updateItem<K extends "milestones" | "letters">(key: K, i: number, patch: Partial<BucinProfile[K][number]>) {
    const arr = [...(draft[key] as any[])];
    arr[i] = { ...arr[i], ...patch };
    set(key, arr as any);
  }
  function removeItem<K extends "milestones" | "letters">(key: K, i: number) {
    set(key, (draft[key] as any[]).filter((_, j) => j !== i) as any);
  }
}

const inputCls =
  "w-full rounded-xl px-4 py-2.5 bg-background/70 border focus:outline-none focus:ring-2 focus:ring-primary text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Section({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`glass rounded-3xl p-6 shadow-soft space-y-3 animate-fade-in ${className}`}>
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function PhotoPicker({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        {value ? <img src={value} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
      </div>
      <label className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm cursor-pointer flex items-center gap-2">
        <Upload className="w-4 h-4" /> {label}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) onChange(await fileToDataURL(f));
          }}
        />
      </label>
      {value && (
        <button onClick={() => onChange("")} className="text-destructive text-sm">
          Hapus
        </button>
      )}
    </div>
  );
}
