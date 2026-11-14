import { useEffect, useMemo, useSyncExternalStore } from "react";
import { badgesFor, getProfile, PROFILES, type Gender, type Profile } from "./profiles";
import { useAccount, useRequireAccount, type Account } from "./session";

/** Maximum simultaneous active chats, so members engage seriously. */
export const ACTIVE_CHAT_CAP = 3;

export type ChatStatus = "active" | "frozen" | "ended";
export interface ChatMessage {
  id: string;
  from: "me" | "them";
  kind: "text" | "voice";
  text?: string | undefined;
  audio?: string | undefined;
  seconds?: number | undefined;
  at: number;
}
export interface Thread { profileId: string; status: ChatStatus; startedAt: number; messages: ChatMessage[] }
export interface SafetyReport { id: string; profileId: string; at: number; reason: string }
export interface ChatState {
  forGender: Gender;
  matches: string[];
  proposals: string[];
  sent: string[];
  threads: Thread[];
  reports: SafetyReport[];
}

export const ICEBREAKERS = [
  "What does a tranquil Muslim home mean to you?",
  "How do you keep your Salah consistent?",
  "Where would you like to live after Nikah?",
  "Which Surah moves your heart the most?",
];

const uid = () => Math.random().toString(36).slice(2, 10);
const MIN = 60_000;

/** Only the opposite gender is shown for matches, proposals and chats. */
export function candidatesFor(gender: Gender) {
  return PROFILES.filter((p) => p.gender !== gender);
}

export function seedState(gender: Gender, now = Date.now()): ChatState {
  const opposite = [...candidatesFor(gender)].sort((a, b) => b.match - a.match);
  const proposal = opposite[0];
  const matches = opposite.slice(-4).map((p) => p.id);
  const threads: Thread[] = matches.slice(0, 2).map((id, i) => {
    const p = getProfile(id)!;
    const first = p.name.split(" ")[0];
    const t = now - (i + 1) * 47 * MIN;
    return {
      profileId: id, status: "active", startedAt: t - 90 * MIN,
      messages: i === 0
        ? [
            { id: uid(), from: "them", kind: "text", text: "Assalamu alaikum! JazakAllah khair for connecting. I really liked your note about a tranquil home.", at: t - 40 * MIN },
            { id: uid(), from: "me", kind: "text", text: `Wa alaikum assalam ${first}! BarakAllahu feek. What does a peaceful home look like to you?`, at: t - 30 * MIN },
            { id: uid(), from: "them", kind: "voice", seconds: 14, at: t },
          ]
        : [
            { id: uid(), from: "them", kind: "text", text: "Assalamu alaikum. May Allah make this conversation a means of khair for us both.", at: t - 20 * MIN },
            { id: uid(), from: "them", kind: "text", text: "Would you like to share what matters most to you in a spouse?", at: t },
          ],
    };
  });
  return { forGender: gender, matches, proposals: proposal ? [proposal.id] : [], sent: [], threads, reports: [] };
}

export const findThread = (s: ChatState, id: string) => s.threads.find((t) => t.profileId === id);
export const activeCount = (s: ChatState) => s.threads.filter((t) => t.status === "active").length;
const patchThread = (s: ChatState, id: string, fn: (t: Thread) => Thread): ChatState => ({ ...s, threads: s.threads.map((t) => (t.profileId === id ? fn(t) : t)) });

/** Connecting with someone who already proposed to you creates a mutual match. */
export function connect(s: ChatState, id: string): { state: ChatState; mutual: boolean } {
  if (s.matches.includes(id)) return { state: s, mutual: true };
  if (s.proposals.includes(id)) return { state: { ...s, proposals: s.proposals.filter((x) => x !== id), matches: [id, ...s.matches] }, mutual: true };
  return { state: s.sent.includes(id) ? s : { ...s, sent: [...s.sent, id] }, mutual: false };
}
export const declineProposal = (s: ChatState, id: string): ChatState => ({ ...s, proposals: s.proposals.filter((x) => x !== id) });

export type StartResult = { state: ChatState; ok: true } | { state: ChatState; ok: false; reason: "cap" | "not-matched" | "frozen" };
export function startChat(s: ChatState, id: string, now = Date.now()): StartResult {
  if (!s.matches.includes(id)) return { state: s, ok: false, reason: "not-matched" };
  const t = findThread(s, id);
  if (t?.status === "active") return { state: s, ok: true };
  if (t?.status === "frozen") return { state: s, ok: false, reason: "frozen" };
  if (activeCount(s) >= ACTIVE_CHAT_CAP) return { state: s, ok: false, reason: "cap" };
  if (t) return { state: patchThread(s, id, (x) => ({ ...x, status: "active" })), ok: true };
  return { state: { ...s, threads: [{ profileId: id, status: "active", startedAt: now, messages: [] }, ...s.threads] }, ok: true };
}

/** Messages can only be added to an active (not frozen or ended) chat. */
export function sendMessage(s: ChatState, id: string, msg: Omit<ChatMessage, "id" | "from" | "at">, now = Date.now()): ChatState {
  if (findThread(s, id)?.status !== "active") return s;
  return patchThread(s, id, (t) => ({ ...t, messages: [...t.messages, { ...msg, id: uid(), from: "me", at: now }] }));
}

/** Report & Freeze: locks the chat immediately and logs a safety report. */
export function reportAndFreeze(s: ChatState, id: string, reason = "Reported from chat", now = Date.now()): { state: ChatState; report: SafetyReport } {
  const report: SafetyReport = { id: `SR-${uid().toUpperCase().slice(0, 6)}`, profileId: id, at: now, reason };
  return { state: { ...patchThread(s, id, (t) => ({ ...t, status: "frozen" })), reports: [...s.reports, report] }, report };
}
export const endChat = (s: ChatState, id: string): ChatState => patchThread(s, id, (t) => (t.status === "active" ? { ...t, status: "ended" } : t));

/** Guardian CC shows when the member added a Guardian WhatsApp number with updates on, or the match has a linked Wali. */
export function guardianCC(account: Pick<Account, "guardianWhatsapp" | "guardianUpdates">, p: Pick<Profile, "waliLinked">) {
  return (!!account.guardianWhatsapp?.trim() && !!account.guardianUpdates) || p.waliLinked;
}

export function sharedValues(a: Pick<Account, "practice" | "living" | "timeline">, p: Profile) {
  const out: string[] = [];
  if (a.practice?.includes("🕌 5x Daily Salah") && p.salah5x) out.push("🕌 5x Salah");
  if (a.living === "Separate Home" && p.separateHome) out.push("🏡 Separate Home");
  if (a.living === "Joint / Near Family" && !p.separateHome) out.push("👨‍👩‍👧 Near Family");
  const span = a.timeline?.replace(/ (Mos|Yrs)$/, "");
  if (span && p.timeline.includes(span)) out.push(`💍 Nikah in ${a.timeline}`);
  return out.length ? out : badgesFor(p);
}

/* ---------- Browser store (saved on this device) ---------- */
export const CHATS_KEY = "mawaddah.chats.v1";
const listeners = new Set<() => void>();
let cacheRaw: string | null = null;
let cache: ChatState | null = null;

function read(): ChatState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CHATS_KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try { cache = raw ? JSON.parse(raw) : null; } catch { cache = null; }
  }
  return cache;
}
function write(s: ChatState) {
  const raw = JSON.stringify(s);
  try { localStorage.setItem(CHATS_KEY, raw); cacheRaw = raw; } catch { cacheRaw = null; }
  cache = s;
  listeners.forEach((l) => l());
}
function ensureChats(gender: Gender) {
  const s = read();
  if (!s || s.forGender !== gender) write(seedState(gender));
}
function apply<T>(fn: (s: ChatState) => { state: ChatState } & T): (T & { state: ChatState }) | null {
  const s = read();
  if (!s) return null;
  const r = fn(s);
  if (r.state !== s) write(r.state);
  return r;
}

export const chats = {
  connect: (id: string) => apply((s) => connect(s, id))?.mutual ?? false,
  decline: (id: string) => apply((s) => ({ state: declineProposal(s, id) })),
  start: (id: string) => apply((s) => startChat(s, id)) as StartResult | null,
  send: (id: string, msg: Omit<ChatMessage, "id" | "from" | "at">) => apply((s) => ({ state: sendMessage(s, id, msg) })),
  reportAndFreeze: (id: string) => apply((s) => reportAndFreeze(s, id))?.report ?? null,
  end: (id: string) => apply((s) => ({ state: endChat(s, id) })),
};

/** Signed-in account plus its matches and chats; null until both are ready. */
export function useChatSession() {
  const ready = useRequireAccount();
  const raw = useAccount();
  const account = useMemo<Account | null>(() => (raw ? JSON.parse(raw) : null), [raw]);
  const gender = account?.gender;
  useEffect(() => { if (ready && gender) ensureChats(gender); }, [ready, gender]);
  const state = useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), read, () => null);
  if (!ready || !account || !state || state.forGender !== account.gender) return null;
  return { account, state };
}

export function timeAgo(at: number, now = Date.now()) {
  const m = Math.max(0, Math.round((now - at) / MIN));
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
}
