# MemePulse production roadmap

## Implemented in this release

The app now polls current Solana market data, retains up to 240 server-side snapshots per token for a rolling historical view, exposes risk reports combining local liquidity/flow heuristics with the public RugCheck summary endpoint, and keeps all scores labelled as research outputs. The mobile product includes live scanning, paper fills, fee/slippage modelling, backtests, local watchlists, persisted alert preferences, and report sharing.

## Historical data limitation

The public Dexscreener REST API provides current pair state rather than OHLC history. The built-in chart history therefore starts when the service observes a token and is not backfilled. A production-grade backfill requires a historical provider such as Bitquery or an equivalent indexed Solana data service and a configured API key.

## Safety boundary

This product intentionally does not request seed phrases, private keys, wallet permissions, transaction signatures, or live order routing. Users may independently review a proposed manual plan and transact outside the product. No screen or endpoint submits a financial transaction.

## Remaining production work

1. Add durable database storage for snapshots, alerts, watchlists, and per-user audit logs.
2. Configure a historical Solana provider for OHLCV backfill and trade-level replay.
3. Add push delivery after the user selects a channel and supplies the necessary notification configuration.
4. Add token-account inspection for mint authority, freeze authority, token-2022 extensions, holder concentration, and sellability checks.
5. Add rate-limit budgets, retries with backoff, provider health status, and data-quality monitors.
6. Add privacy policy, terms, responsible-use copy, and a user export/delete flow before public release.
