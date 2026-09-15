export type MarketToken = {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  liquidityUsd: number;
  volume24hUsd: number;
  volume1hUsd: number;
  change1hPct: number;
  change24hPct: number;
  buys1h: number;
  sells1h: number;
  pairUrl: string;
  dexId: string;
  source: "dexscreener";
  observedAt: string;
};

const API = "https://api.dexscreener.com";
let cache: { at: number; data: MarketToken[] } | null = null;

function num(value: unknown): number { return typeof value === "number" && Number.isFinite(value) ? value : 0; }

export function normalizePair(pair: any, observedAt = new Date().toISOString()): MarketToken | null {
  if (!pair || pair.chainId !== "solana" || !pair.baseToken?.address) return null;
  const txns = pair.txns?.h1 ?? {};
  const volume = pair.volume ?? {};
  const change = pair.priceChange ?? {};
  return {
    address: String(pair.baseToken.address),
    symbol: String(pair.baseToken.symbol ?? "UNKNOWN").slice(0, 16),
    name: String(pair.baseToken.name ?? "Unnamed token").slice(0, 48),
    priceUsd: pair.priceUsd == null ? null : Number(pair.priceUsd),
    liquidityUsd: num(pair.liquidity?.usd),
    volume24hUsd: num(volume.h24),
    volume1hUsd: num(volume.h1),
    change1hPct: num(change.h1),
    change24hPct: num(change.h24),
    buys1h: num(txns.buys),
    sells1h: num(txns.sells),
    pairUrl: String(pair.url ?? ""),
    dexId: String(pair.dexId ?? "unknown"),
    source: "dexscreener",
    observedAt,
  };
}

export async function fetchLatestMarketSnapshot(): Promise<MarketToken[]> {
  if (cache && Date.now() - cache.at < 30_000) return cache.data;
  const profilesResponse = await fetch(`${API}/token-profiles/latest/v1`, { headers: { Accept: "application/json" } });
  if (!profilesResponse.ok) throw new Error(`profiles_${profilesResponse.status}`);
  const profiles = await profilesResponse.json() as Array<{ chainId?: string; tokenAddress?: string }>;
  const addresses = profiles.filter((item) => item.chainId === "solana" && item.tokenAddress).map((item) => item.tokenAddress as string).slice(0, 25);
  if (!addresses.length) return [];
  const pairsResponse = await fetch(`${API}/tokens/v1/solana/${addresses.join(",")}`, { headers: { Accept: "application/json" } });
  if (!pairsResponse.ok) throw new Error(`tokens_${pairsResponse.status}`);
  const pairs = await pairsResponse.json() as any[];
  const observedAt = new Date().toISOString();
  const result = pairs.map((pair) => normalizePair(pair, observedAt)).filter((item): item is MarketToken => Boolean(item));
  const deduped = Array.from(new Map(result.map((item) => [item.address, item])).values()).sort((a, b) => b.volume1hUsd - a.volume1hUsd);
  cache = { at: Date.now(), data: deduped };
  return deduped;
}
