export const PUMP_SNIPER_PROFILE = {
  maxAgeMinutes: 3,
  minInitialBuyUsd: 5_000,
  minMarketCapUsd: 10_000,
  minHolders: 50,
} as const;

export type PumpSniperCandidate = {
  ageMinutes: number;
  initialBuyUsd: number | null;
  marketCapUsd: number | null;
  holders: number | null;
};

export type PumpSniperDecision = {
  eligible: boolean;
  reasons: string[];
  missing: string[];
};

export function evaluatePumpSniperCandidate(candidate: PumpSniperCandidate): PumpSniperDecision {
  const reasons: string[] = [];
  const missing: string[] = [];
  if (candidate.ageMinutes <= PUMP_SNIPER_PROFILE.maxAgeMinutes) reasons.push("age_under_3_minutes");
  else missing.push("age_over_3_minutes");
  if ((candidate.initialBuyUsd ?? -1) >= PUMP_SNIPER_PROFILE.minInitialBuyUsd) reasons.push("initial_buy_at_least_5000_usd");
  else missing.push("initial_buy_below_5000_usd_or_unknown");
  if ((candidate.marketCapUsd ?? -1) >= PUMP_SNIPER_PROFILE.minMarketCapUsd) reasons.push("market_cap_at_least_10000_usd");
  else missing.push("market_cap_below_10000_usd_or_unknown");
  if ((candidate.holders ?? -1) >= PUMP_SNIPER_PROFILE.minHolders) reasons.push("at_least_50_holders");
  else missing.push("fewer_than_50_holders_or_unknown");
  return { eligible: missing.length === 0, reasons, missing };
}
