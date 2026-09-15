import { describe, expect, it } from "vitest";
import { backtestTrades, simulateFill } from "../lib/simulation";

describe("paper execution engine", () => {
  it("models fees and liquidity impact without external side effects", () => {
    const fill = simulateFill({ side: "BUY", notionalUsd: 500, priceUsd: 0.001, liquidityUsd: 10_000 });
    expect(fill.status).toBe("SIMULATED");
    expect(fill.feeUsd).toBeCloseTo(6.25);
    expect(fill.priceImpactPct).toBeCloseTo(2.5);
    expect(fill.assumptions.join(" ")).toContain("no order was sent");
  });
  it("calculates hypothetical ending equity with fees and slippage", () => {
    const result = backtestTrades([{ entry: 1, exit: 1.2, sizeUsd: 1000 }, { entry: 2, exit: 1.8, sizeUsd: 1000 }]);
    expect(result.tradeCount).toBe(2);
    expect(result.endingEquity).toBeLessThan(10_000 + 200);
    expect(result.pnlUsd).toBe(result.endingEquity - result.initialEquity);
  });
});
