import { describe, expect, it } from "vitest";
import { getPriceDisplay, packages, type PricingPackage } from "./site";

describe("pricing packages", () => {
  it("has exactly three packages: upwork, dual, linkedin", () => {
    expect(packages.map((p) => p.id)).toEqual(["upwork", "dual", "linkedin"]);
  });

  it("every package requires a 90-day minimum commitment", () => {
    for (const p of packages) expect(p.minimumCommitmentDays).toBe(90);
  });

  it("only the dual-channel package is recommended", () => {
    expect(packages.filter((p) => p.recommended).map((p) => p.id)).toEqual(["dual"]);
  });

  it("unconfigured price shows Discuss pricing, never $0", () => {
    const d = getPriceDisplay({ ...packages[0]!, monthlyPrice: null });
    expect(d.configured).toBe(false);
    expect(d.primary).toBe("Discuss pricing");
  });

  it("configured price renders from config", () => {
    const pkg: PricingPackage = { ...packages[0]!, monthlyPrice: 2500, commitmentTotal: 7500 };
    const d = getPriceDisplay(pkg);
    expect(d.primary).toBe("$2,500");
    expect(d.configured && d.total).toBe("$7,500 total for 90 days");
  });
});
