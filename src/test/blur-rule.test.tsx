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
  it("Wali-supervised filter keeps only matching profiles", () => {
    const r = applyFilters(PROFILES, { ...EMPTY_FILTERS, waliOnly: true });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((p) => p.waliLinked)).toBe(true);
  });
});
