import { useEffect, useState, useCallback } from "react";

export type BucinProfile = {
  name1: string;
  name2: string;
  bio1: string;
  bio2: string;
  birthday1: string; // YYYY-MM-DD
  birthday2: string;
  anniversary: string; // YYYY-MM-DD
  quote: string;
  photo1?: string; // dataURL
  photo2?: string;
  gallery: string[]; // dataURLs
  letters: { id: string; from: string; to: string; title: string; body: string; date: string }[];
  milestones: { id: string; date: string; title: string; description: string }[];
};

const KEY = "bucin.profile.v1";
const ADMIN_KEY = "bucin.admin.token";
const ADMIN_HASH_KEY = "bucin.admin.hash";
const ADMIN_ATTEMPTS_KEY = "bucin.admin.attempts";
export const ADMIN_PASSCODE = "loveislove"; // default; dapat diubah dari panel
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getStoredHash(): Promise<string> {
  const existing = localStorage.getItem(ADMIN_HASH_KEY);
  if (existing) return existing;
  const h = await sha256(ADMIN_PASSCODE);
  localStorage.setItem(ADMIN_HASH_KEY, h);
  return h;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type AttemptState = { count: number; lockedUntil: number };
function readAttempts(): AttemptState {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_ATTEMPTS_KEY) || "null") ?? { count: 0, lockedUntil: 0 };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}
function writeAttempts(s: AttemptState) {
  localStorage.setItem(ADMIN_ATTEMPTS_KEY, JSON.stringify(s));
}
export function adminLockRemainingMs(): number {
  if (typeof window === "undefined") return 0;
  const s = readAttempts();
  return Math.max(0, s.lockedUntil - Date.now());
}

const defaults: BucinProfile = {
  name1: "Rangga",
  name2: "Sasha",
  bio1: "Pemuja senja, penulis puisi diam-diam.",
  bio2: "Pecinta hujan dan kopi tanpa gula.",
  birthday1: "2001-05-14",
  birthday2: "2002-09-22",
  anniversary: "2023-02-14",
  quote: "Dua jiwa, satu detak, selamanya.",
  photo1: "",
  photo2: "",
  gallery: [],
  letters: [
    {
      id: "1",
      from: "Rangga",
      to: "Sasha",
      title: "Untukmu, yang membuat waktu berhenti",
      body: "Setiap kali kamu tersenyum, dunia terasa sedikit lebih ringan. Terima kasih sudah menjadi rumah bagi hatiku.",
      date: new Date().toISOString(),
    },
  ],
  milestones: [
    { id: "1", date: "2023-02-14", title: "Hari Pertama Kita", description: "Awal dari segalanya." },
    { id: "2", date: "2023-06-10", title: "Liburan Pertama", description: "Menyusuri pantai berdua." },
  ],
};

export function loadProfile(): BucinProfile {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveProfile(p: BucinProfile) {
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("bucin:profile"));
}

export function useProfile() {
  const [profile, setProfile] = useState<BucinProfile>(defaults);
  useEffect(() => {
    setProfile(loadProfile());
    const h = () => setProfile(loadProfile());
    window.addEventListener("bucin:profile", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("bucin:profile", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const update = useCallback((patch: Partial<BucinProfile>) => {
    const next = { ...loadProfile(), ...patch };
    saveProfile(next);
    setProfile(next);
  }, []);
  return { profile, update };
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "1";
}
export async function loginAdmin(code: string): Promise<{ ok: boolean; error?: string }> {
  const lock = adminLockRemainingMs();
  if (lock > 0) {
    return { ok: false, error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(lock / 1000)} detik.` };
  }
  const stored = await getStoredHash();
  const input = await sha256(code);
  if (timingSafeEqual(stored, input)) {
    writeAttempts({ count: 0, lockedUntil: 0 });
    localStorage.setItem(ADMIN_KEY, "1");
    window.dispatchEvent(new CustomEvent("bucin:admin"));
    return { ok: true };
  }
  const s = readAttempts();
  const count = s.count + 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
  writeAttempts({ count: count >= MAX_ATTEMPTS ? 0 : count, lockedUntil });
  return {
    ok: false,
    error: lockedUntil
      ? `Terlalu banyak percobaan. Terkunci ${Math.ceil(LOCKOUT_MS / 1000)} detik.`
      : `Kode salah. Sisa percobaan: ${MAX_ATTEMPTS - count}.`,
  };
}

export async function changeAdminPasscode(current: string, next: string): Promise<{ ok: boolean; error?: string }> {
  if (next.length < 6) return { ok: false, error: "Passcode baru minimal 6 karakter." };
  const stored = await getStoredHash();
  const cur = await sha256(current);
  if (!timingSafeEqual(stored, cur)) return { ok: false, error: "Passcode saat ini salah." };
  const newHash = await sha256(next);
  localStorage.setItem(ADMIN_HASH_KEY, newHash);
  return { ok: true };
}
export function logoutAdmin() {
  localStorage.removeItem(ADMIN_KEY);
  window.dispatchEvent(new CustomEvent("bucin:admin"));
}

export function daysBetween(from: string, to = new Date().toISOString().slice(0, 10)) {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.max(0, Math.floor((b - a) / (1000 * 60 * 60 * 24)));
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
