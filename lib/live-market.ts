import AsyncStorage from "@react-native-async-storage/async-storage";

export type LiveMarketItem = {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  marketCapUsd: number;
  liquidityUsd: number;
  volume1hUsd: number;
  change1hPct: number;
  change24hPct: number;
  buys1h: number;
  sells1h: number;
  pairCreatedAt: string | null;
  capturedAt: string;
  source: string;
  signal: "EARLY_FLOW" | "MOMENTUM" | "X10_CANDIDATE" | "X100_CANDIDATE" | "RISK";
  peakChangePct: number;
};

const KEY = "memepulse.live-market.v1";
const MAX_ITEMS = 500;

export async function loadLiveMarket(): Promise<LiveMarketItem[]> {
  try { return JSON.parse((await AsyncStorage.getItem(KEY)) ?? "[]") as LiveMarketItem[]; } catch { return []; }
}

export async function captureLiveMarket(tokens: Array<Omit<LiveMarketItem, "capturedAt" | "signal" | "peakChangePct">>) {
  const current = await loadLiveMarket();
  const byAddress = new Map(current.map((item) => [item.address, item]));
  for (const token of tokens) {
    const previous = byAddress.get(token.address);
    const change = token.change24hPct;
    const signal: LiveMarketItem["signal"] = change >= 10_000 ? "X100_CANDIDATE" : change >= 900 ? "X10_CANDIDATE" : token.liquidityUsd < 5_000 ? "RISK" : token.buys1h >= 2 && token.buys1h >= token.sells1h ? "EARLY_FLOW" : "MOMENTUM";
    byAddress.set(token.address, { ...token, capturedAt: new Date().toISOString(), signal, peakChangePct: Math.max(previous?.peakChangePct ?? 0, change) });
  }
  const next = Array.from(byAddress.values()).sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()).slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearLiveMarket() { await AsyncStorage.removeItem(KEY); }

export function buildLiveMarketReport(items: LiveMarketItem[]) {
  const counts = items.reduce<Record<string, number>>((acc, item) => { acc[item.signal] = (acc[item.signal] ?? 0) + 1; return acc; }, {});
  const lines = ["MemePulse Live Market Report", `generated=${new Date().toISOString()}`, `items=${items.length}`, `early_flow=${counts.EARLY_FLOW ?? 0}`, `momentum=${counts.MOMENTUM ?? 0}`, `x10_candidates=${counts.X10_CANDIDATE ?? 0}`, `x100_candidates=${counts.X100_CANDIDATE ?? 0}`, `risk=${counts.RISK ?? 0}`, "", "address,symbol,signal,price_usd,market_cap_usd,liquidity_usd,volume_1h_usd,change_1h_pct,change_24h_pct,buys_1h,sells_1h,peak_change_pct,captured_at"];
  for (const item of items) lines.push([item.address, item.symbol, item.signal, item.priceUsd ?? "", item.marketCapUsd, item.liquidityUsd, item.volume1hUsd, item.change1hPct, item.change24hPct, item.buys1h, item.sells1h, item.peakChangePct, item.capturedAt].join(","));
  return lines.join("\n");
}
