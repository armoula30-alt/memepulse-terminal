import type { RiskReport, HistoricalPoint, MarketToken } from "@/server/market-data";
import { loadPumpPortalTokens } from "@/lib/pumpportal-live";

const LIVE_BUILD = process.env.EXPO_PUBLIC_PUMPPORTAL_LIVE === "true";

const now = Date.now();

const addresses = {
  moon: "7YcQb7nYx7v6Qf3Jm8h4Vq5w2Tz9Kp6Ls1Nd3Rf8Gm2A",
  frog: "9xKp4Lm7Qv2Tn8Rs5Yw3Hd6Jc1Aa9Fg2Bz7Ve4Pu6Xq",
  pepe: "5mRz8Qa2Vn6Kx4Tp9Yh3Ld7Ws1Fc5Bj8Gq2Ne6Xu4Tr",
};

function token(
  address: string,
  symbol: string,
  name: string,
  priceUsd: number,
  marketCapUsd: number,
  liquidityUsd: number,
  volume1hUsd: number,
  change1hPct: number,
  change24hPct: number,
  buys1h: number,
  sells1h: number,
  ageMinutes: number,
): MarketToken {
  return {
    address,
    symbol,
    name,
    priceUsd,
    marketCapUsd,
    liquidityUsd,
    volume24hUsd: volume1hUsd * 18,
    volume1hUsd,
    change1hPct,
    change24hPct,
    buys1h,
    sells1h,
    pairUrl: `https://pump.fun/coin/${address}`,
    pairAddress: address,
    pairCreatedAt: new Date(now - ageMinutes * 60_000).toISOString(),
    dexId: "local-demo",
    source: "dexscreener",
    observedAt: new Date(now).toISOString(),
  };
}

export const LOCAL_TOKENS: MarketToken[] = [
  token(addresses.moon, "MOON", "Moon Signal", 0.0042, 420_000, 86_000, 31_500, 18.4, 64.2, 148, 61, 18),
  token(addresses.frog, "FROG", "Frog Terminal", 0.0017, 170_000, 42_000, 12_800, 7.1, 22.8, 72, 38, 42),
  token(addresses.pepe, "PEPE2", "Pepe Research", 0.00083, 83_000, 18_500, 6_400, -4.8, 9.6, 41, 49, 95),
];

export const LOCAL_EVENTS = LOCAL_TOKENS.slice(0, 2).map((item, index) => ({
  mint: item.address,
  symbol: item.symbol,
  name: item.name,
  uri: "local://demo",
  creator: "local-demo-creator",
  marketCapSol: 2.4 + index,
  initialBuy: 0.35 + index * 0.1,
  createdAt: item.pairCreatedAt ?? new Date(now).toISOString(),
  source: "local-demo" as const,
}));

export const LOCAL_FIRST_TRADES = LOCAL_EVENTS.map((event, index) => ({
  mint: event.mint,
  txType: "buy" as const,
  solAmount: 0.4 + index * 0.2,
  tokenAmount: 100_000 + index * 50_000,
  marketCapSol: event.marketCapSol,
  trader: "local-demo-trader",
  createdAt: event.createdAt,
  source: "local-demo" as const,
  analysis: {
    verdict: "REVIEW_ONLY",
    score: 72 - index * 8,
    reasons: ["local demo event", "paper research only"],
    warning: "Synthetic data; no transaction was submitted.",
  },
}));

export async function localLatest() {
  const live = await loadPumpPortalTokens();
  const liveTokens: MarketToken[] = live.map((item) => ({
    address: item.address,
    symbol: item.symbol,
    name: item.name,
    priceUsd: item.priceUsd,
    marketCapUsd: item.marketCapUsd,
    liquidityUsd: item.liquidityUsd,
    volume24hUsd: item.volume1hUsd * 18,
    volume1hUsd: item.volume1hUsd,
    change1hPct: item.change1hPct,
    change24hPct: item.change24hPct,
    buys1h: item.buys1h,
    sells1h: item.sells1h,
    pairUrl: `https://pump.fun/coin/${item.address}`,
    pairAddress: item.address,
    pairCreatedAt: item.pairCreatedAt,
    dexId: "pumpportal",
    source: "dexscreener",
    observedAt: item.capturedAt,
  }));
  return {
    source: LIVE_BUILD ? "PumpPortal live" : liveTokens.length ? "PumpPortal live + local demo fallback" : "Local demo dataset",
    chain: "solana",
    observedAt: new Date().toISOString(),
    tokens: (LIVE_BUILD ? liveTokens : [...liveTokens, ...LOCAL_TOKENS]).map((item) => ({ ...item, observedAt: new Date().toISOString() })),
  };
}

export function localNewTokens() {
  if (LIVE_BUILD) {
    return {
      source: "PumpPortal live",
      observedAt: new Date().toISOString(),
      stream: { configured: true, connected: false, source: "pumpportal", trackedTokens: 0, note: "Waiting for the PumpPortal stream and API key." },
      events: [],
      firstTrades: [],
      tokens: [],
      allTokens: [],
    };
  }
  return {
    source: "Local demo dataset",
    observedAt: new Date().toISOString(),
    stream: {
      configured: false,
      connected: false,
      source: "local-demo",
      trackedTokens: 0,
      note: "Synthetic events are enabled for local testing. No network stream is active.",
    },
    events: LOCAL_EVENTS,
    firstTrades: LOCAL_FIRST_TRADES,
    tokens: LOCAL_TOKENS,
    allTokens: LOCAL_TOKENS,
  };
}

export function localSafety(address: string) {
  const tokenItem = LOCAL_TOKENS.find((item) => item.address === address);
  return {
    address,
    mintAuthority: null,
    freezeAuthority: null,
    holders: tokenItem ? 842 : null,
    topHolderPercent: tokenItem ? 6.4 : null,
    top10HolderPercent: tokenItem ? 21.7 : null,
    topHolders: [],
    source: "local-demo",
    note: "Synthetic safety values for UI testing only. They do not represent on-chain state.",
    observedAt: new Date().toISOString(),
  };
}

export function localRisk(address: string): RiskReport {
  const item = LOCAL_TOKENS.find((tokenItem) => tokenItem.address === address);
  const liquidityUsd = item?.liquidityUsd ?? 0;
  return {
    address,
    score: item ? 68 : null,
    level: item ? (liquidityUsd < 25_000 ? "MEDIUM" : "LOW") : "UNKNOWN",
    liquidityUsd,
    buySellRatio: item ? Number((item.buys1h / Math.max(item.sells1h, 1)).toFixed(2)) : null,
    flags: item ? ["local_demo_data"] : ["no_current_snapshot"],
    source: "local-demo",
    observedAt: new Date().toISOString(),
    note: "Synthetic risk report for local UI testing only.",
  };
}

export function localOhlcv(address: string) {
  const item = LOCAL_TOKENS.find((tokenItem) => tokenItem.address === address);
  const close = item?.priceUsd ?? 0.001;
  const points: HistoricalPoint[] = Array.from({ length: 24 }, (_, index) => {
    const factor = 0.88 + index * 0.006;
    const open = close * factor;
    const final = close * (factor + (index % 3 === 0 ? 0.012 : -0.004));
    return {
      timestamp: Math.floor((now - (23 - index) * 300_000) / 1000),
      open,
      high: Math.max(open, final) * 1.01,
      low: Math.min(open, final) * 0.99,
      close: final,
      volume: item?.volume1hUsd ?? 0,
      source: "local-demo",
    };
  });
  return { address, source: "local-demo", points };
}

export function localStrategy(address: string) {
  const item = LOCAL_TOKENS.find((tokenItem) => tokenItem.address === address);
  return item ? {
    address,
    score: 54,
    eligible: false,
    reasons: ["local demo history", "paper research only"],
    currentMarketCapUsd: item.marketCapUsd,
    estimatedAthMarketCapUsd: item.marketCapUsd * 1.4,
    pullbackPct: 8.5,
    supportTests: 1,
    riskStopPct: 10,
    targetRule: "below observed ATH / prior high",
    warning: "Synthetic signal. It is not a trading recommendation.",
  } : null;
}

export function localForecast(address: string) {
  return LOCAL_TOKENS.some((item) => item.address === address) ? {
    address,
    horizon: "1h" as const,
    direction: "NEUTRAL" as const,
    probabilityUp: 54,
    probabilityDown: 46,
    confidence: "LOW" as const,
    drivers: ["local demo momentum", "no live provider data"],
    warning: "Synthetic forecast for UI testing only.",
    observedAt: new Date().toISOString(),
  } : null;
}
