import { describe, expect, it } from "vitest";
import { videoStrategySignal } from "../server/market-data";

describe("video strategy filter", () => {
  it("scores deep pullback and repeated support without claiming certainty", () => {
    const token = { address: "abc", symbol: "TEST", name: "Test", priceUsd: 0.25, liquidityUsd: 50000, volume24hUsd: 100000, volume1hUsd: 5000, change1hPct: 2, change24hPct: -10, buys1h: 20, sells1h: 18, pairUrl: "", pairAddress: "pool", pairCreatedAt: new Date(Date.now() - 3 * 3600000).toISOString(), marketCapUsd: 50000, dexId: "test", source: "dexscreener" as const, observedAt: new Date().toISOString() };
    const points = [1, .9, .8, .7, .5, .3, .25, .25, .251, .249, .25].map((price, index) => ({ priceUsd: price, observedAt: new Date(Date.now() - (11-index) * 60000).toISOString() }));
    const result = videoStrategySignal(token, points);
    expect(result.pullbackPct).toBeGreaterThan(70);
    expect(result.supportTests).toBeGreaterThanOrEqual(2);
    expect(result.warning).toContain("not proof");
  });
});
