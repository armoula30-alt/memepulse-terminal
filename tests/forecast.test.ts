import { describe, expect, it } from "vitest";
import { forecastToken, normalizePair } from "../server/market-data";
describe("probabilistic forecast", () => {
  it("returns bounded probabilities and explicit drivers", () => {
    const token = normalizePair({ chainId: "solana", baseToken: { address: "mint-forecast", symbol: "FORECAST" }, priceUsd: "0.01", liquidity: { usd: 100000 }, volume: { h1: 50000, h24: 800000 }, priceChange: { h1: 12, h24: 18 }, txns: { h1: { buys: 120, sells: 60 } } }, "2026-01-01T00:00:00.000Z");
    const result = forecastToken(token!);
    expect(result.probabilityUp + result.probabilityDown).toBe(100);
    expect(result.probabilityUp).toBeGreaterThanOrEqual(5);
    expect(result.probabilityUp).toBeLessThanOrEqual(95);
    expect(result.warning).toContain("not a price guarantee");
    expect(result.drivers).toHaveLength(3);
  });
});
