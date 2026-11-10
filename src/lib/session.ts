import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";

export type Gender = "man" | "woman";
export interface Account {
  gender: Gender;
  firstName: string;
  dob: string;
  city: string;
  country: string;
  guardianName?: string | undefined;
  guardianWhatsapp?: string | undefined;
  photo?: string | undefined;
  privacyBlur: boolean;
  sect: string;
  timeline: string;
  email: string;
  password: string;
}

const ACCOUNT_KEY = "mawaddah.account";
const SESSION_KEY = "mawaddah.signedIn";
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
  return typeof window !== "undefined" && localStorage.getItem(SESSION_KEY) === "1" && !!getAccount();
}
export function register(a: Account) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ ...a, privacyBlur: a.gender === "woman" && a.privacyBlur }));
  localStorage.setItem(SESSION_KEY, "1");
  emit();
}
export function signIn(email: string, password: string) {
  const a = getAccount();
  if (!a || a.email.toLowerCase() !== email.trim().toLowerCase() || a.password !== password) return false;
  localStorage.setItem(SESSION_KEY, "1");
  emit();
  return true;
}
export function resetOnboarding() {
  localStorage.removeItem(ACCOUNT_KEY);
  localStorage.removeItem(SESSION_KEY);
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
