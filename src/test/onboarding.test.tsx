import { describe, expect, it } from "vitest";
import { defaultBlurFor, guardianUpdatesDefault, isSignedIn, register, resetOnboarding } from "@/lib/session";
import { canAdvance } from "@/lib/onboarding";

describe("Onboarding blur default", () => {
  it("is ON for women", () => expect(defaultBlurFor("woman")).toBe(true));
  it("is OFF for men", () => expect(defaultBlurFor("man")).toBe(false));
});

describe("Strict four-step onboarding", () => {
  const data = {gender: "woman" as const, firstName: "Amina", dob: "1998-05-14", city: "Kano", country: "Nigeria", photos: ["uploaded-image"], sect: "Sunni • Hanafi", timeline: "6–12 Mos", email: "amina@example.com", password: "test123"};
  it("starts signed out with no completed onboarding", () => {resetOnboarding(); expect(isSignedIn()).toBe(false);});
  it("does not accept a legacy session as completed onboarding", () => {resetOnboarding();localStorage.setItem("mawaddah.signedIn", "1");localStorage.setItem("mawaddah.account", JSON.stringify(data));expect(isSignedIn()).toBe(false);resetOnboarding();});
  it("requires introduction fields before Step 2", () => expect(canAdvance(0, {...data, gender: null})).toBe(false));
  it("allows skipping the optional Wali step", () => expect(canAdvance(1, data)).toBe(true));
  it("requires a device photo before Step 4", () => expect(canAdvance(2, {...data, photos: Array(6).fill("")})).toBe(false));
  it("requires account details before discovery", () => expect(canAdvance(3, {...data, password: ""})).toBe(false));
  it("allows discovery after completed registration", () => {register({...data, photo: data.photos[0], privacyBlur: true});expect(isSignedIn()).toBe(true);resetOnboarding();});
  it("defaults guardian WhatsApp updates on when a number is entered", () => expect(guardianUpdatesDefault("+2348000000000")).toBe(true));
  it("keeps guardian updates off without a number", () => expect(guardianUpdatesDefault("  ")).toBe(false));
  it("cannot store privacy blur for a man", () => {register({...data, gender: "man", privacyBlur: true});expect(JSON.parse(localStorage.getItem("mawaddah.account") ?? "{}").privacyBlur).toBe(false);resetOnboarding();});
});
