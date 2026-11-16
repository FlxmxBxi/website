import { sanitizeProfile } from "./coach.js";
import { CHECKIN_OPTIONS, CHECKIN_QUESTIONS } from "./survey.js";

export const STORAGE_KEY = "last-bell-v1";

function sanitizeMessage(message) {
  if (!message || typeof message !== "object") return null;
  if (message.role !== "coach" && message.role !== "student") return null;
  if (typeof message.text !== "string" || !message.text.trim()) return null;
  return {
    id: typeof message.id === "string" ? message.id.slice(0, 40) : "m",
    role: message.role,
    text: message.text.slice(0, 2000),
    showPlan: Boolean(message.showPlan),
  };
}

function sanitizeCheckin(input) {
  if (!input || typeof input !== "object") return null;
  const checkin = {};
  for (const question of CHECKIN_QUESTIONS) {
    if (!CHECKIN_OPTIONS.includes(input[question.id])) return null;
    checkin[question.id] = input[question.id];
  }
  return checkin;
}

export function emptyStore() {
  return {
    profile: sanitizeProfile(null),
    checkin: null,
    messages: [],
    suggestions: [],
    keep: true,
  };
}

export function sanitizeStore(input) {
  const store = emptyStore();
  if (!input || typeof input !== "object") return store;
  store.profile = sanitizeProfile(input.profile);
  store.checkin = sanitizeCheckin(input.checkin);
  if (Array.isArray(input.messages)) {
    store.messages = input.messages.map(sanitizeMessage).filter(Boolean).slice(-40);
  }
  if (Array.isArray(input.suggestions)) {
    store.suggestions = input.suggestions
      .filter((item) => typeof item === "string")
      .slice(0, 8)
      .map((item) => item.slice(0, 80));
  }
  return store;
}

const EMPTY = emptyStore();
const FAILED = { ...emptyStore(), keep: false };
let memoryOverride = null;
let cachedRaw;
let cachedStore = EMPTY;

function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("last-bell-change"));
}

export function subscribeEvening(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("last-bell-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("last-bell-change", callback);
  };
}

export function getServerEvening() {
  return EMPTY;
}

export function getEveningSnapshot() {
  if (memoryOverride) return memoryOverride;
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return FAILED;
  }
  if (raw == null) return EMPTY;
  if (raw === cachedRaw) return cachedStore;
  cachedRaw = raw;
  try {
    cachedStore = sanitizeStore(JSON.parse(raw));
  } catch {
    cachedStore = FAILED;
  }
  return cachedStore;
}

export function loadStore() {
  if (typeof localStorage === "undefined") return FAILED;
  return getEveningSnapshot();
}

export function saveStore(store) {
  const safe = sanitizeStore(store);
  if (typeof localStorage === "undefined") {
    memoryOverride = { ...safe, keep: false };
    notify();
    return false;
  }
  try {
    const raw = JSON.stringify(safe);
    localStorage.setItem(STORAGE_KEY, raw);
    memoryOverride = null;
    cachedRaw = raw;
    cachedStore = safe;
    notify();
    return true;
  } catch {
    memoryOverride = { ...safe, keep: false };
    notify();
    return false;
  }
}

export function clearStore() {
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      memoryOverride = FAILED;
      notify();
      return;
    }
  }
  memoryOverride = null;
  cachedRaw = undefined;
  cachedStore = EMPTY;
  notify();
}
