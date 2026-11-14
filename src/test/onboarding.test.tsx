import { describe, expect, it } from "vitest";
import { defaultBlurFor, getPendingAuth, guardianUpdatesDefault, isSignedIn, register, resetOnboarding, savePendingAuth, signIn, validateSignup } from "@/lib/session";
import { canAdvance, formatDob } from "@/lib/onboarding";

describe("Onboarding blur default", () => {
  it("is ON for women", () => expect(defaultBlurFor("woman")).toBe(true));
  it("is OFF for men", () => expect(defaultBlurFor("man")).toBe(false));
});

describe("Strict four-step onboarding", () => {
  const steps = {gender: "woman" as const, fullName: "Amina Bello", dob: "1998-05-14", marital: "Never married", currentCountry: "Nigeria", bornCountry: "Nigeria", ethnicity: "Hausa", languages: "Hausa, English", photos: ["uploaded-image"], timeline: "6–12 Mos"};
  const account = {gender: "woman" as const, firstName: "Amina", dob: "1998-05-14", city: "Kano", country: "Nigeria", sect: "", timeline: "6–12 Mos", email: "amina@example.com", password: "test123", privacyBlur: true};
  it("starts signed out with no completed onboarding", () => {resetOnboarding(); expect(isSignedIn()).toBe(false);});
  it("does not accept a legacy session as completed onboarding", () => {resetOnboarding();localStorage.setItem("mawaddah.signedIn", "1");localStorage.setItem("mawaddah.account", JSON.stringify(account));expect(isSignedIn()).toBe(false);resetOnboarding();});
  it("requires introduction fields before Step 2", () => expect(canAdvance(0, {...steps, gender: null})).toBe(false));
  it("requires Current country before Step 2", () => expect(canAdvance(0, {...steps, currentCountry: ""})).toBe(false));
  it("rejects members under 18", () => expect(canAdvance(0, {...steps, dob: "2015-01-01"})).toBe(false));
  it("allows skipping the optional Wali step", () => expect(canAdvance(1, steps)).toBe(true));
  it("requires a device photo before Step 4", () => expect(canAdvance(2, {...steps, photos: Array(6).fill("")})).toBe(false));
  it("Step 4 needs only a Nikkah timeline, no email or password", () => {expect(canAdvance(3, steps)).toBe(true);expect(canAdvance(3, {...steps, timeline: ""})).toBe(false);});
  it("formats date of birth with age", () => expect(formatDob("1998-05-14", new Date(2026, 10, 14))).toBe("14 May 1998 (28)"));
  it("allows discovery after completed registration", () => {register(account);expect(isSignedIn()).toBe(true);resetOnboarding();});
  it("defaults guardian WhatsApp updates on when a number is entered", () => expect(guardianUpdatesDefault("+2348000000000")).toBe(true));
  it("keeps guardian updates off without a number", () => expect(guardianUpdatesDefault("  ")).toBe(false));
  it("cannot store privacy blur for a man", () => {register({...account, gender: "man"});expect(JSON.parse(localStorage.getItem("mawaddah.account") ?? "{}").privacyBlur).toBe(false);resetOnboarding();});
});

describe("Radar screen sign-up happens once, before Step 1", () => {
  it("rejects an invalid email", () => expect(validateSignup({method: "email", email: "nope", phone: "", password: "test123"})).not.toBe(""));
  it("rejects a password under 6 characters", () => expect(validateSignup({method: "google", email: "a@b.co", phone: "", password: "12345"})).not.toBe(""));
  it("accepts a phone sign-up without an email", () => expect(validateSignup({method: "phone", email: "", phone: "+234 800 000 0000", password: "test123"})).toBe(""));
  it("carries valid details into onboarding", () => {resetOnboarding();savePendingAuth({method: "email", email: "a@b.co", phone: "", password: "test123"});expect(getPendingAuth()?.email).toBe("a@b.co");resetOnboarding();expect(getPendingAuth()).toBeNull();});
  it("lets a phone member sign in with their number", () => {register({gender: "man", firstName: "Yusuf", dob: "1995-01-01", city: "Lagos", country: "Nigeria", sect: "", timeline: "3–6 Mos", email: "", phone: "+234 800 000 0000", password: "test123", privacyBlur: false});localStorage.removeItem("mawaddah.signedIn");expect(signIn("+2348000000000", "test123")).toBe(true);expect(signIn("", "test123")).toBe(false);resetOnboarding();});
});
