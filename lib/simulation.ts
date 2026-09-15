export type SimulationInput = { side: "BUY" | "SELL"; notionalUsd: number; priceUsd: number; liquidityUsd: number; feeRate?: number; slippageBudgetPct?: number };
export type SimulatedFill = { side: "BUY" | "SELL"; requestedUsd: number; estimatedPriceUsd: number; priceImpactPct: number; slippagePct: number; feeUsd: number; netUsd: number; status: "SIMULATED"; assumptions: string[] };

export function simulateFill(input: SimulationInput): SimulatedFill {
  const liquidity = Math.max(input.liquidityUsd, 1);
  const size = Math.max(input.notionalUsd, 0);
  const priceImpactPct = Math.min((size / liquidity) * 100 * 0.5, 35);
  const slippagePct = Math.min(priceImpactPct + (input.slippageBudgetPct ?? 1.5), 50);
  const feeUsd = size * (input.feeRate ?? 0.0125);
  const direction = input.side === "BUY" ? 1 : -1;
  const estimatedPriceUsd = input.priceUsd * (1 + direction * slippagePct / 100);
  return {
    side: input.side,
    requestedUsd: size,
    estimatedPriceUsd,
    priceImpactPct,
    slippagePct,
    feeUsd,
    netUsd: Math.max(0, size - feeUsd),
    status: "SIMULATED",
    assumptions: ["Public quote snapshot; no order was sent", "Pump.fun-style 1.25% fee assumption", "Impact approximated from notional/liquidity", "Actual fill may differ materially in volatile markets"],
  };
}

export type BacktestTrade = { entry: number; exit: number; sizeUsd: number; feeRate?: number; slippagePct?: number };
export function backtestTrades(trades: BacktestTrade[]) {
  let equity = 10_000;
  let wins = 0;
  let grossPnl = 0;
  for (const trade of trades) {
    const gross = ((trade.exit - trade.entry) / trade.entry) * trade.sizeUsd;
    const costs = trade.sizeUsd * ((trade.feeRate ?? 0.0125) * 2 + (trade.slippagePct ?? 0.015) * 2);
    const pnl = gross - costs;
    equity += pnl;
    grossPnl += pnl;
    if (pnl > 0) wins += 1;
  }
  return { initialEquity: 10_000, endingEquity: Number(equity.toFixed(2)), pnlUsd: Number(grossPnl.toFixed(2)), returnPct: Number((grossPnl / 10_000 * 100).toFixed(2)), tradeCount: trades.length, winRatePct: trades.length ? Number((wins / trades.length * 100).toFixed(2)) : 0 };
}
