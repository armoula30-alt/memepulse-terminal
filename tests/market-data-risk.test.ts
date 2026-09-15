import { describe, expect, it } from "vitest";
import { buildHeuristicRisk, normalizePair } from "../server/market-data";
describe("market risk layer", () => {
  it("flags thin liquidity and extreme move", () => {
    const token = normalizePair({ chainId: "solana", baseToken: { address: "mint-risk", symbol: "RISK" }, liquidity: { usd: 2000 }, volume: { h1: 5000, h24: 5000 }, priceChange: { h1: 140 }, txns: { h1: { buys: 100, sells: 5 } } }, "2026-01-01T00:00:00.000Z");
    expect(token).not.toBeNull();
    const risk = buildHeuristicRisk(token!);
    expect(risk.level).toBe("HIGH");
    expect(risk.flags).toEqual(expect.arrayContaining(["very_thin_liquidity", "extreme_volatility", "buy_sell_imbalance"]));
  });
});
