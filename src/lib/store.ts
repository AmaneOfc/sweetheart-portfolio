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
export const ADMIN_PASSCODE = "loveislove"; // simple client-side gate

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
export function loginAdmin(code: string): boolean {
  if (code === ADMIN_PASSCODE) {
    localStorage.setItem(ADMIN_KEY, "1");
    window.dispatchEvent(new CustomEvent("bucin:admin"));
    return true;
  }
  return false;
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
