# MemePulse production roadmap

## Implemented in this release

The app now polls a broader Solana candidate set, retains snapshots in the project database when available, exposes historical OHLCV through GeckoTerminal, exposes risk reports combining local liquidity/flow heuristics with the public RugCheck summary endpoint, and provides a bounded probabilistic 1H forecast with drivers and warnings. The mobile product includes live scanning, visible prices, tap-to-open token evidence, paper fills, fee/slippage modelling, backtests, local watchlists, persisted alert preferences, and report sharing.

## Historical data limitation

The public Dexscreener REST API provides current pair state rather than OHLC history. MemePulse now uses GeckoTerminal's public OHLCV endpoint when a current pair address is available, and falls back to durable snapshots. A higher-volume production deployment should configure a paid/indexed provider and enforce provider-specific rate budgets.

## Safety boundary

This product intentionally does not request seed phrases, private keys, wallet permissions, transaction signatures, or live order routing. Users may independently review a proposed manual plan and transact outside the product. No screen or endpoint submits a financial transaction.

## Remaining production work

1. Add durable database storage for alerts, watchlists, and per-user audit logs; market snapshot storage is now implemented.
2. Configure a higher-volume historical Solana provider for OHLCV backfill and trade-level replay; the public GeckoTerminal adapter is now implemented as a baseline.
3. Add push delivery after the user selects a channel and supplies the necessary notification configuration.
4. Add token-account inspection for mint authority, freeze authority, token-2022 extensions, holder concentration, and sellability checks.
5. Add rate-limit budgets, retries with backoff, provider health status, and data-quality monitors.
6. Add privacy policy, terms, responsible-use copy, and a user export/delete flow before public release.
