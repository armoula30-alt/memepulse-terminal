# Solana Signal — Native Android

Native Kotlin/Jetpack Compose signal-only Android application built from `prompt.md`.

## Scope

- One persistent PumpPortal WebSocket connection.
- Official data subscriptions only: `subscribeNewToken`, `subscribeMigration`, `subscribeTokenTrade`, and `subscribeAccountTrade`; documented unsubscribe methods are used where PumpPortal documents them.
- Local Room/SQLite storage for tokens, trades, metrics, scores, signals, outcomes, system events, and settings.
- Foreground Service, notification channels, encrypted API-key storage, reconnect/backoff, deduplication, and subscription restoration.
- Explainable Momentum Score (0–100); basic eligibility filters never trigger BUY alone.
- Manual Photon action only: copy mint and open the verified Photon website. No invented token deep link.

## Explicitly excluded

No wallet, private key, seed phrase, signing, broadcasting, Jupiter, Raydium, PumpPortal Trading API, automatic buy, automatic sell, or position management.

## Build

```bash
cd native-android
./gradlew testDebugUnitTest assembleRelease
```

GitHub Actions builds `app-release.apk` and publishes it as a GitHub Release asset. A real Android device test is still required for final acceptance of WebSocket connectivity, background execution, and notifications.

## Sources

- https://pumpportal.fun/data-api/real-time/
- https://pumpportal.fun/FAQ/
- https://pumpportal.fun/fees/
- https://photon-sol.tinyastro.io/
