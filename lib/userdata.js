// Per-user key/value sync against the backend /api/userdata store, with a
// localStorage mirror so everything keeps working offline / for logged-out
// users / if the endpoint isn't deployed yet. Once the user is logged in and
// the backend is reachable, data syncs across web <-> mobile.
import api from './api';

const LS_PREFIX = 'voca_ud_';

export function readLocal(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

export function writeLocal(key, value) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch {}
}

// Load: returns localStorage immediately via fallback, and resolves with the
// backend value if available (merged into localStorage).
export async function loadUserData(key, fallback) {
  const local = readLocal(key, fallback);
  try {
    const { data } = await api.get(`/api/userdata/${key}`);
    if (data !== null && data !== undefined) { writeLocal(key, data); return data; }
  } catch {}
  return local;
}

// Save: writes localStorage now, fire-and-forget to backend.
export function saveUserData(key, value) {
  writeLocal(key, value);
  api.put(`/api/userdata/${key}`, { value }).catch(() => {});
}

// ── Legacy-key bridge ──────────────────────────────────────────────
// For state that already lives under a non-prefixed localStorage key
// (e.g. 'voca_learn_progress'). Keeps that key as the synchronous source
// of truth while mirroring it to the backend userdata store.
export async function pullLegacy(lsKey, udKey) {
  try {
    const { data } = await api.get(`/api/userdata/${udKey}`);
    if (data !== null && data !== undefined && typeof window !== 'undefined') {
      localStorage.setItem(lsKey, JSON.stringify(data));
      return data;
    }
  } catch {}
  return null;
}

export function pushLegacy(lsKey, udKey, value) {
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(lsKey, JSON.stringify(value)); } catch {}
  }
  api.put(`/api/userdata/${udKey}`, { value }).catch(() => {});
}
