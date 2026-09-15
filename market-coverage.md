# MemePulse market coverage

MemePulse now combines three read-only discovery layers. Dexscreener latest profiles, recent updates, and boosts are merged into batched Solana pair requests, currently covering up to 300 discovered token addresses per refresh. The `New` filter narrows those results to pairs whose creation timestamp is within the last 24 hours.

A PumpPortal `subscribeNewToken` WebSocket adapter is also included. It requires a user-provided `PUMPPORTAL_API_KEY` because the provider requires an API key for the creation stream. When configured, one server-side connection stores the latest 250 creation events and exposes its connection status through the app API. Without the key, Dexscreener remains the safe public fallback; the app explicitly reports that the stream is not configured rather than implying complete coverage.

No public free endpoint can guarantee discovery of every meme coin across every launchpad, DEX, chain, or unindexed event. Rate limits, pair indexing delay, delistings, failed migrations, and provider outages create coverage gaps. The application therefore labels the source and timestamp, retains observed snapshots, and does not fabricate missing prices or safety fields.

The video strategy is implemented as a research filter: age above one hour when known, current market cap above $30,000, observed high market cap above $300,000, a deep pullback, repeated support tests, and a liquidity floor. These are tunable hypotheses, not proof of a future pump. The walk-forward module evaluates directional rules out of sample and reports accuracy, average return per step, and drawdown; it does not guarantee profitability.

On-chain safety inspection uses public Solana RPC calls for mint authority, freeze authority, total supply, and largest token accounts. A missing or unavailable response is shown as unknown, never as safe. Authority status and top-holder concentration are necessary evidence but do not constitute a complete honeypot, insider, bundle, or rug-pull assessment.
