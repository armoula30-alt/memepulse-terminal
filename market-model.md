# MemePulse market model

MemePulse is a research and simulation environment. The mobile client reads public Solana pair snapshots through the server proxy. The current adapter uses Dexscreener's public token profiles and token-pairs endpoints, caches snapshots for 30 seconds, and labels every result with source and observedAt.

The paper fill model uses a hypothetical 1.25% fee assumption inspired by pump.fun's public bonding-curve documentation, plus a notional-to-liquidity impact approximation and a configurable slippage budget. This is not a quote, execution receipt, or prediction of realized profit.

The Backtest screen is a transparent computational artifact. It applies fees and slippage to hypothetical entries and exits, but does not model all real-world failure modes such as latency, MEV, token freezes, failed sells, holder concentration, or regime changes.

No wallet keys, signing, transaction endpoints, custody, or live order routing are present.
