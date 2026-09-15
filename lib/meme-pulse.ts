export type MemeCandidate = { liquidityUsd: number; volume1hUsd: number; momentumPct: number; risk: "MED" | "HIGH" | "EXTREME" };

export function opportunityScore(candidate: MemeCandidate): number {
  const liquidityComponent = Math.min(candidate.liquidityUsd / 1000, 35);
  const activityComponent = Math.min(candidate.volume1hUsd / Math.max(candidate.liquidityUsd, 1) * 12, 35);
  const momentumComponent = Math.min(Math.max(candidate.momentumPct, 0) * 1.4, 20);
  const riskPenalty = candidate.risk === "EXTREME" ? 18 : candidate.risk === "HIGH" ? 8 : 0;
  return Math.round(Math.max(0, Math.min(100, liquidityComponent + activityComponent + momentumComponent + 10 - riskPenalty)));
}

export function riskLabel(score: number): "GUARDED" | "WATCH" | "DANGER" {
  if (score >= 70) return "GUARDED";
  if (score >= 45) return "WATCH";
  return "DANGER";
}
