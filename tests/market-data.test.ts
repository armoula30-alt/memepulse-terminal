import { describe, expect, it } from "vitest";
import { normalizePair } from "../server/market-data";

describe("market data normalization", () => {
  it("normalizes a Solana pair into an auditable snapshot", () => {
    const result = normalizePair({ chainId: "solana", baseToken: { address: "mint-1", symbol: "TEST", name: "Test Coin" }, priceUsd: "0.0012", liquidity: { usd: 25000 }, volume: { h1: 12000, h24: 50000 }, priceChange: { h1: 4.5, h24: 9 }, txns: { h1: { buys: 20, sells: 8 } }, url: "https://dexscreener.com/solana/pair", dexId: "pumpswap" }, "2026-01-01T00:00:00.000Z");
    expect(result).toMatchObject({ address: "mint-1", symbol: "TEST", liquidityUsd: 25000, volume1hUsd: 12000, buys1h: 20, sells1h: 8, source: "dexscreener", observedAt: "2026-01-01T00:00:00.000Z" });
  });
  it("rejects non-Solana pairs", () => {
    expect(normalizePair({ chainId: "ethereum", baseToken: { address: "mint-1" } })).toBeNull();
  });
});
