# External data sources

- Dexscreener API reference: https://docs.dexscreener.com/api/reference
  - Used for current token profiles and Solana token/pair snapshots. Public profile/boost endpoints are rate-limited; current pair data is not a historical OHLC feed.
- GeckoTerminal API guide: https://apiguide.geckoterminal.com/
  - Used for public OHLCV retrieval by Solana pool address through `/api/v2/networks/solana/pools/{pool}/ohlcv/minute`.
  - The API is beta/public and subject to provider rate limits and changes; a higher-volume deployment should use a configured paid/indexed provider.
- RugCheck Swagger: https://api.rugcheck.xyz/swagger/index.html
  - Used for a public token report summary when available. The app combines provider flags with local liquidity/flow heuristics and never treats the score as a guarantee.
- Solana token authority documentation: https://solana.com/docs/tokens/basics/set-authority
  - Confirms that mint accounts can store mint and freeze authorities; authority inspection remains a future hardening task.
- Bitquery Dexscreener/Solana history note: https://docs.bitquery.io/docs/blockchain/Solana/DEXScreener/solana_dexscreener/
  - Confirms Dexscreener's public REST data is current-state oriented and that historical/streaming data requires a separate indexed provider or retained snapshots.
