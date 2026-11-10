import { describe, expect, it } from "vitest";
import { defaultBlurFor } from "@/lib/session";

describe("Onboarding blur default", () => {
  it("is ON for women", () => expect(defaultBlurFor("woman")).toBe(true));
  it("is OFF for men", () => expect(defaultBlurFor("man")).toBe(false));
});
