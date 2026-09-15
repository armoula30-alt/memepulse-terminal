import { describe, expect, it } from "vitest";
import { opportunityScore, riskLabel } from "../lib/meme-pulse";

describe("MemePulse scoring", () => {
  it("rewards liquid, active candidates without exceeding 100", () => {
    const score = opportunityScore({ liquidityUsd: 72500, volume1hUsd: 485000, momentumPct: 18.4, risk: "HIGH" });
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("penalizes extreme risk even when momentum is high", () => {
    const score = opportunityScore({ liquidityUsd: 20000, volume1hUsd: 90000, momentumPct: 20, risk: "EXTREME" });
    expect(score).toBeLessThan(70);
  });

  it("maps score bands to clear labels", () => {
    expect(riskLabel(82)).toBe("GUARDED");
    expect(riskLabel(58)).toBe("WATCH");
    expect(riskLabel(31)).toBe("DANGER");
  });
});
