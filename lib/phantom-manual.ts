import { assertQuoteFresh, type DirectQuote, type QuoteFreshnessPolicy, DEFAULT_QUOTE_POLICY } from "./quote-freshness";

export type ManualConfirmPlan = {
  id: string;
  mint: string;
  side: "BUY" | "SELL";
  quote: DirectQuote;
  createdAtMs: number;
  status: "READY_FOR_PHANTOM" | "EXPIRED" | "CANCELLED";
  warning: "USER_MUST_REVIEW_IN_PHANTOM";
};

export function createManualConfirmPlan(quote: DirectQuote, policy: QuoteFreshnessPolicy = DEFAULT_QUOTE_POLICY): ManualConfirmPlan {
  assertQuoteFresh(quote, policy);
  return { id: quote.id, mint: quote.mint, side: quote.side, quote, createdAtMs: Date.now(), status: "READY_FOR_PHANTOM", warning: "USER_MUST_REVIEW_IN_PHANTOM" };
}

export function invalidateManualConfirmPlan(plan: ManualConfirmPlan): ManualConfirmPlan {
  return { ...plan, status: "CANCELLED" };
}

export function isManualConfirmPlanFresh(plan: ManualConfirmPlan, policy: QuoteFreshnessPolicy = DEFAULT_QUOTE_POLICY) {
  if (plan.status !== "READY_FOR_PHANTOM") return false;
  try { assertQuoteFresh(plan.quote, policy); return true; } catch { return false; }
}
