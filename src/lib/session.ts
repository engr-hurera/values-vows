import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";

export type Gender = "man" | "woman";
export interface Account {
  gender: Gender;
  firstName: string;
  fullName?: string | undefined;
  dob: string;
  height?: string | undefined;
  maritalStatus?: string | undefined;
  bornCountry?: string | undefined;
  ethnicity?: string | undefined;
  languages?: string[] | undefined;
  city: string;
  country: string;
  guardianName?: string | undefined;
  guardianWhatsapp?: string | undefined;
  guardianUpdates?: boolean | undefined;
  photos?: string[] | undefined;
  practice?: string[] | undefined;
  living?: string | undefined;
  voiceIntro?: string | undefined;
  photo?: string | undefined;
  privacyBlur: boolean;
  sect: string;
  timeline: string;
  email: string;
  password: string;
  phone?: string | undefined;
  authMethod?: AuthMethod | undefined;
  antiScreenshot?: boolean | undefined;
}

export type AuthMethod = "phone" | "google" | "email";
/** Credentials chosen on the radar screen, carried into the 4 steps so Step 4 never asks again. */
export interface PendingAuth { method: AuthMethod; email: string; phone: string; password: string }
const PENDING_KEY = "mawaddah.pendingAuth";
const digits = (v: string) => v.replace(/\D/g, "");

/** Returns an error message, or "" when the radar sign-up details are valid. */
export function validateSignup(a: PendingAuth) {
  if (a.method === "phone") { if (digits(a.phone).length < 7) return "Enter a valid phone number."; }
  else if (!/^\S+@\S+\.\S+$/.test(a.email.trim())) return "Enter a valid email address.";
  if (a.password.length < 6) return "Password must be at least 6 characters.";
  return "";
}
export function savePendingAuth(a: PendingAuth) { sessionStorage.setItem(PENDING_KEY, JSON.stringify(a)); }
export function getPendingAuth(): PendingAuth | null {
  if (typeof window === "undefined") return null;
  try { const a = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "null"); return a && !validateSignup(a) ? a : null; } catch { return null; }
}
export function clearPendingAuth() { sessionStorage.removeItem(PENDING_KEY); }

const ACCOUNT_KEY = "mawaddah.account";
const SESSION_KEY = "mawaddah.signedIn";
const ONBOARDED_KEY = "mawaddah.onboarded.v2";
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Blur toggle is only offered to women and defaults ON; men never get blur. */
export function defaultBlurFor(gender: Gender) {
  return gender === "woman";
}

export function getAccount(): Account | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null"); } catch { return null; }
}
export function isSignedIn() {
  return typeof window !== "undefined" && localStorage.getItem(ONBOARDED_KEY) === "1" && localStorage.getItem(SESSION_KEY) === "1" && !!getAccount();
}
export function guardianUpdatesDefault(number: string) { return !!number.trim(); }
export function updateAccount(patch: Partial<Account>) {
  const account = getAccount();
  if (!account) return;
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...account, ...patch }));
  emit();
}
export function register(a: Account) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...a, privacyBlur: a.gender === "woman" && a.privacyBlur }));
  localStorage.setItem(SESSION_KEY, "1");
  localStorage.setItem(ONBOARDED_KEY, "1");
  emit();
}
/** Signs in with the email or phone number used at sign-up. */
export function signIn(identifier: string, password: string) {
  const a = getAccount();
  const id = identifier.trim().toLowerCase();
  const matches = !!id && ((!!a?.email && a.email.toLowerCase() === id) || (!!a?.phone && digits(id).length >= 7 && digits(a.phone) === digits(id)));
  if (!a || !matches || a.password !== password) return false;
  localStorage.setItem(SESSION_KEY, "1");
  localStorage.setItem(ONBOARDED_KEY, "1");
  emit();
  return true;
}
export function resetOnboarding() {
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ONBOARDED_KEY);
  localStorage.removeItem("mawaddah.chats.v1");
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(PENDING_KEY);
  emit();
}

export function useAccount() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => localStorage.getItem(ACCOUNT_KEY),
    () => null,
  );
}

/** Sends visitors without an account back to the splash screen. Returns true once allowed to render. */
export function useRequireAccount() {
  const navigate = useNavigate();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (isSignedIn()) setOk(true);
    else navigate({ to: "/", replace: true });
  }, [navigate]);
  return ok;
}
