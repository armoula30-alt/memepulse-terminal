export type MarketToken = {
  address: string; symbol: string; name: string; priceUsd: number | null; liquidityUsd: number; volume24hUsd: number; volume1hUsd: number; change1hPct: number; change24hPct: number; buys1h: number; sells1h: number; pairUrl: string; dexId: string; source: "dexscreener"; observedAt: string;
};
export type RiskReport = { address: string; score: number | null; level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN"; liquidityUsd: number; buySellRatio: number | null; flags: string[]; source: string; observedAt: string; note: string };
const API = "https://api.dexscreener.com";
const RUGCHECK = "https://api.rugcheck.xyz/v1";
let cache: { at: number; data: MarketToken[] } | null = null;
const history = new Map<string, MarketToken[]>();
function num(value: unknown): number { return typeof value === "number" && Number.isFinite(value) ? value : 0; }
export function normalizePair(pair: any, observedAt = new Date().toISOString()): MarketToken | null {
  if (!pair || pair.chainId !== "solana" || !pair.baseToken?.address) return null;
  const txns = pair.txns?.h1 ?? {}; const volume = pair.volume ?? {}; const change = pair.priceChange ?? {};
  return { address: String(pair.baseToken.address), symbol: String(pair.baseToken.symbol ?? "UNKNOWN").slice(0, 16), name: String(pair.baseToken.name ?? "Unnamed token").slice(0, 48), priceUsd: pair.priceUsd == null ? null : Number(pair.priceUsd), liquidityUsd: num(pair.liquidity?.usd), volume24hUsd: num(volume.h24), volume1hUsd: num(volume.h1), change1hPct: num(change.h1), change24hPct: num(change.h24), buys1h: num(txns.buys), sells1h: num(txns.sells), pairUrl: String(pair.url ?? ""), dexId: String(pair.dexId ?? "unknown"), source: "dexscreener", observedAt };
}
function remember(data: MarketToken[]) { for (const item of data) { const points = history.get(item.address) ?? []; points.push(item); history.set(item.address, points.slice(-240)); } }
export async function fetchLatestMarketSnapshot(): Promise<MarketToken[]> {
  if (cache && Date.now() - cache.at < 30_000) return cache.data;
  const profilesResponse = await fetch(`${API}/token-profiles/latest/v1`, { headers: { Accept: "application/json" } });
  if (!profilesResponse.ok) throw new Error(`profiles_${profilesResponse.status}`);
  const profiles = await profilesResponse.json() as Array<{ chainId?: string; tokenAddress?: string }>;
  const addresses = profiles.filter((item) => item.chainId === "solana" && item.tokenAddress).map((item) => item.tokenAddress as string).slice(0, 25);
  if (!addresses.length) return [];
  const pairsResponse = await fetch(`${API}/tokens/v1/solana/${addresses.join(",")}`, { headers: { Accept: "application/json" } });
  if (!pairsResponse.ok) throw new Error(`tokens_${pairsResponse.status}`);
  const pairs = await pairsResponse.json() as any[]; const observedAt = new Date().toISOString();
  const result = pairs.map((pair) => normalizePair(pair, observedAt)).filter((item): item is MarketToken => Boolean(item));
  const deduped = Array.from(new Map(result.map((item) => [item.address, item])).values()).sort((a, b) => b.volume1hUsd - a.volume1hUsd);
  remember(deduped); cache = { at: Date.now(), data: deduped }; return deduped;
}
export function getTokenHistory(address: string) { return history.get(address) ?? []; }
export function buildHeuristicRisk(token: MarketToken): RiskReport {
  const flags: string[] = []; const ratio = token.sells1h ? token.buys1h / token.sells1h : token.buys1h > 0 ? 99 : null;
  if (token.liquidityUsd < 10_000) flags.push("very_thin_liquidity"); else if (token.liquidityUsd < 50_000) flags.push("thin_liquidity");
  if (ratio !== null && ratio > 8) flags.push("buy_sell_imbalance"); if (token.change1hPct < -25) flags.push("sharp_decline"); if (token.change1hPct > 100) flags.push("extreme_volatility");
  const score = Math.max(0, Math.min(100, Math.round(70 - flags.length * 18 + Math.min(token.liquidityUsd / 10_000, 20))));
  return { address: token.address, score, level: score >= 70 ? "LOW" : score >= 45 ? "MEDIUM" : "HIGH", liquidityUsd: token.liquidityUsd, buySellRatio: ratio === null ? null : Number(ratio.toFixed(2)), flags, source: "local_heuristics", observedAt: new Date().toISOString(), note: "Heuristic only; verify mint/freeze authorities and holder concentration independently." };
}
export async function fetchRiskReport(address: string): Promise<RiskReport> {
  const token = cache?.data.find((item) => item.address === address); const fallback = token ? buildHeuristicRisk(token) : { address, score: null, level: "UNKNOWN" as const, liquidityUsd: 0, buySellRatio: null, flags: ["no_current_snapshot"], source: "local_heuristics", observedAt: new Date().toISOString(), note: "No current market snapshot available." };
  try { const response = await fetch(`${RUGCHECK}/tokens/${encodeURIComponent(address)}/report/summary`, { headers: { Accept: "application/json" } }); if (!response.ok) return fallback; const report = await response.json() as any; const score = typeof report.score === "number" ? report.score : fallback.score; const providerFlags = Array.isArray(report.risks) ? report.risks.slice(0, 8).map((risk: any) => String(risk.name ?? risk.description ?? "risk")) : []; const flags = Array.from(new Set([...fallback.flags, ...providerFlags])); const level = fallback.liquidityUsd < 10_000 || fallback.flags.includes("sharp_decline") ? "HIGH" : fallback.liquidityUsd < 50_000 || flags.length > 2 ? "MEDIUM" : "LOW"; return { ...fallback, score, level, flags, source: "rugcheck_plus_local", note: "RugCheck summary plus local market heuristics; a provider score cannot override thin liquidity or market-structure warnings." }; } catch { return fallback; }
}
