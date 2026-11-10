import { describe, expect, it } from "vitest";
import { applyFilters, EMPTY_FILTERS, PROFILES, shouldBlur } from "@/lib/profiles";

describe("Woman-Only Blur Rule", () => {
  it("blurs a woman with privacy blur enabled", () => {
    expect(shouldBlur({ gender: "woman", privacyBlur: true })).toBe(true);
  });
  it("never blurs a man, even with blur flag set", () => {
    expect(shouldBlur({ gender: "man", privacyBlur: true })).toBe(false);
  });
  it("does not blur a woman who has blur off", () => {
    expect(shouldBlur({ gender: "woman", privacyBlur: false })).toBe(false);
  });
});

describe("Filters", () => {
  it("Willing to Relocate keeps only relocating profiles", () => {
    const r = applyFilters(PROFILES, { ...EMPTY_FILTERS, willingToRelocate: true });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.willingToRelocate)).toBe(true);
  });
  it("language filter matches any selected language", () => {
    const r = applyFilters(PROFILES, { ...EMPTY_FILTERS, languages: ["Yoruba"] });
    expect(r.map((p) => p.id)).toEqual(["yusuf"]);
  });
});
