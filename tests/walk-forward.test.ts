import { describe, expect, it } from "vitest";
import { walkForwardStats } from "../lib/walk-forward";
describe("walk-forward validation", () => { it("keeps out-of-sample metrics bounded", () => { const prices = Array.from({ length: 40 }, (_, index) => 100 + index * 2); const result = walkForwardStats(prices, 10); expect(result.trades).toBe(29); expect(result.accuracyPct).toBeGreaterThanOrEqual(0); expect(result.accuracyPct).toBeLessThanOrEqual(100); expect(result.maxDrawdownPct).toBeGreaterThanOrEqual(0); }); });
