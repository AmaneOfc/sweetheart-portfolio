import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

// IndexedDB helpers for storing audio blob
const DB_NAME = "bucin-music";
const STORE = "audio";
const KEY = "current";

function openDB(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function idbGet(): Promise<{ blob: Blob; name: string } | null> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
    tx.onsuccess = () => res(tx.result ?? null);
    tx.onerror = () => rej(tx.error);
  });
}
async function idbPut(blob: Blob, name: string) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite").objectStore(STORE).put({ blob, name }, KEY);
    tx.onsuccess = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbClear() {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite").objectStore(STORE).delete(KEY);
    tx.onsuccess = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

type Ctx = {
  hasTrack: boolean;
  trackName: string;
  playing: boolean;
  volume: number;
  toggle: () => void;
  setVolume: (v: number) => void;
  uploadTrack: (file: File) => Promise<void>;
  clearTrack: () => Promise<void>;
  needsGesture: boolean;
};

const MusicCtx = createContext<Ctx | null>(null);
const STATE_KEY = "bucin.music.state.v1";

type PersistState = { playing: boolean; volume: number; time: number; wantPlay: boolean };
function loadState(): PersistState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { playing: false, volume: 0.6, time: 0, wantPlay: true };
}
function saveState(s: PersistState) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasTrack, setHasTrack] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.6);
  const [needsGesture, setNeedsGesture] = useState(false);
  const urlRef = useRef<string>("");

  // init
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;
    const st = loadState();
    setVolumeState(st.volume);
    audio.volume = st.volume;

    (async () => {
      const rec = await idbGet();
      if (!rec) return;
      const url = URL.createObjectURL(rec.blob);
      urlRef.current = url;
      audio.src = url;
      setHasTrack(true);
      setTrackName(rec.name);
      audio.currentTime = st.time || 0;
      if (st.wantPlay) {
        try {
          await audio.play();
          setPlaying(true);
        } catch {
          setNeedsGesture(true);
        }
      }
    })();

    const onEnd = () => setPlaying(false);
    audio.addEventListener("ended", onEnd);

    // persist position periodically
    const iv = window.setInterval(() => {
      saveState({
        playing: !audio.paused,
        volume: audio.volume,
        time: audio.currentTime,
        wantPlay: !audio.paused ? true : loadState().wantPlay,
      });
    }, 1500);

    const onUnload = () => {
      saveState({
        playing: !audio.paused,
        volume: audio.volume,
        time: audio.currentTime,
        wantPlay: !audio.paused ? true : loadState().wantPlay,
      });
    };
    window.addEventListener("beforeunload", onUnload);

    // Global gesture fallback to unlock autoplay
    const unlock = async () => {
      const s = loadState();
      if (s.wantPlay && audio.src && audio.paused) {
        try {
          await audio.play();
          setPlaying(true);
          setNeedsGesture(false);
        } catch {}
      }
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      audio.removeEventListener("ended", onEnd);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.clearInterval(iv);
      audio.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a || !a.src) return;
    if (a.paused) {
      try {
        await a.play();
        setPlaying(true);
        setNeedsGesture(false);
        saveState({ ...loadState(), wantPlay: true, playing: true });
      } catch {
        setNeedsGesture(true);
      }
    } else {
      a.pause();
      setPlaying(false);
      saveState({ ...loadState(), wantPlay: false, playing: false });
    }
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
    saveState({ ...loadState(), volume: v });
  };

  const uploadTrack = async (file: File) => {
    await idbPut(file, file.name);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const a = audioRef.current!;
    a.src = url;
    setHasTrack(true);
    setTrackName(file.name);
    try {
      await a.play();
      setPlaying(true);
      saveState({ ...loadState(), wantPlay: true, playing: true, time: 0 });
    } catch {
      setNeedsGesture(true);
    }
  };

  const clearTrack = async () => {
    await idbClear();
    const a = audioRef.current!;
    a.pause();
    a.removeAttribute("src");
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
    setHasTrack(false);
    setTrackName("");
    setPlaying(false);
    saveState({ ...loadState(), playing: false, wantPlay: false, time: 0 });
  };

  return (
    <MusicCtx.Provider
      value={{ hasTrack, trackName, playing, volume, toggle, setVolume, uploadTrack, clearTrack, needsGesture }}
    >
      {children}
    </MusicCtx.Provider>
  );
}

export function useMusic() {
  const c = useContext(MusicCtx);
  if (!c) throw new Error("useMusic outside provider");
  return c;
}
