export type TradeSide = "BUY" | "SELL";

export type DirectQuote = {
  id: string;
  side: TradeSide;
  mint: string;
  inputAmountRaw: bigint;
  expectedOutputRaw: bigint;
  minimumOutputRaw: bigint;
  price: number;
  issuedAtMs: number;
  expiresAtMs: number;
  sourceDataAgeMs: number;
  source: "PUMP_FUN" | "DIRECT_POOL" | "RPC";
  recentBlockhash?: string;
  lastValidBlockHeight?: number;
};

export type QuoteFreshnessPolicy = {
  maxQuoteAgeMs: number;
  safetyMarginMs: number;
  maxSourceDataAgeMs: number;
  maxPriceDriftPct: number;
};

export const DEFAULT_QUOTE_POLICY: QuoteFreshnessPolicy = {
  maxQuoteAgeMs: 1_200,
  safetyMarginMs: 250,
  maxSourceDataAgeMs: 700,
  maxPriceDriftPct: 1.5,
};

export class QuoteExpiredError extends Error {
  readonly code = "QUOTE_EXPIRED";
  constructor(message: string) { super(message); this.name = "QuoteExpiredError"; }
}

export class QuoteInvalidError extends Error {
  readonly code = "QUOTE_INVALID";
  constructor(message: string) { super(message); this.name = "QuoteInvalidError"; }
}

export function quoteAgeMs(quote: DirectQuote, nowMs = Date.now()) { return nowMs - quote.issuedAtMs; }
export function remainingQuoteMs(quote: DirectQuote, policy = DEFAULT_QUOTE_POLICY, nowMs = Date.now()) { return Math.min(policy.maxQuoteAgeMs - quoteAgeMs(quote, nowMs), quote.expiresAtMs - nowMs); }

export function assertQuoteFresh(quote: DirectQuote, policy = DEFAULT_QUOTE_POLICY, nowMs = Date.now()) {
  if (!Number.isFinite(quote.price) || quote.price <= 0) throw new QuoteInvalidError("Quote price is invalid");
  if (quote.inputAmountRaw <= 0n || quote.expectedOutputRaw <= 0n || quote.minimumOutputRaw <= 0n) throw new QuoteInvalidError("Quote amounts must be positive");
  const age = quoteAgeMs(quote, nowMs);
  const remaining = remainingQuoteMs(quote, policy, nowMs);
  if (age < 0 || age > policy.maxQuoteAgeMs || quote.sourceDataAgeMs > policy.maxSourceDataAgeMs || remaining <= policy.safetyMarginMs) throw new QuoteExpiredError(`Quote is stale: age=${age}ms remaining=${remaining}ms sourceAge=${quote.sourceDataAgeMs}ms`);
  if (quote.expectedOutputRaw < quote.minimumOutputRaw) throw new QuoteInvalidError("Expected output is below minimum output");
}

export function priceDriftPct(originalPrice: number, currentPrice: number) { return originalPrice > 0 && currentPrice > 0 ? Math.abs((currentPrice - originalPrice) / originalPrice) * 100 : Number.POSITIVE_INFINITY; }
export function assertPriceStillAcceptable(quote: DirectQuote, currentPrice: number, policy = DEFAULT_QUOTE_POLICY) {
  const drift = priceDriftPct(quote.price, currentPrice);
  if (drift > policy.maxPriceDriftPct) throw new QuoteExpiredError(`Price moved ${drift.toFixed(3)}%, limit is ${policy.maxPriceDriftPct}%`);
}

export type QuoteStatus = "FRESH" | "EXPIRED" | "CANCELLED" | "CONSUMED";
export type QuoteCancelReason = "AGE_EXCEEDED" | "SOURCE_DATA_STALE" | "SAFETY_MARGIN_REACHED" | "PRICE_DRIFT" | "USER_DELAY" | "BLOCKHASH_EXPIRED" | "NEW_QUOTE_CREATED" | "MANUAL_CANCEL";
export type TrackedQuote = DirectQuote & { status: QuoteStatus; cancelledAtMs?: number; cancelReason?: QuoteCancelReason };

export class QuoteManager {
  private active: TrackedQuote | null = null;
  constructor(private readonly policy = DEFAULT_QUOTE_POLICY) {}
  setQuote(quote: DirectQuote) { if (this.active) this.cancel("NEW_QUOTE_CREATED"); assertQuoteFresh(quote, this.policy); this.active = { ...quote, status: "FRESH" }; return this.active; }
  getActive() { if (!this.active) return null; try { assertQuoteFresh(this.active, this.policy); return this.active; } catch { this.active = { ...this.active, status: "EXPIRED", cancelledAtMs: Date.now(), cancelReason: "AGE_EXCEEDED" }; return null; } }
  assertActive() { const quote = this.getActive(); if (!quote) throw new QuoteExpiredError("No fresh active quote is available"); return quote; }
  cancel(reason: QuoteCancelReason) { if (this.active && this.active.status !== "CONSUMED") this.active = { ...this.active, status: "CANCELLED", cancelledAtMs: Date.now(), cancelReason: reason }; }
  consume() { const quote = this.assertActive(); this.active = { ...quote, status: "CONSUMED" }; return this.active; }
}

export function validateSignedTradeBeforeBroadcast(quote: DirectQuote, currentPrice: number, policy = DEFAULT_QUOTE_POLICY) {
  assertQuoteFresh(quote, policy);
  assertPriceStillAcceptable(quote, currentPrice, policy);
  return { ok: true as const, quoteId: quote.id, validatedAtMs: Date.now() };
}
