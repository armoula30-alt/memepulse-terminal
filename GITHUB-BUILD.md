# GitHub build

The repository includes `.github/workflows/android-apk.yml`. Every push to `main` and every manual workflow run performs TypeScript checks, tests, lint, Expo Android prebuild, and a release APK build.

After a successful run, open the **Actions** tab, select **Build Android APK**, open the completed run, and download the artifact named `MemePulse-Terminal-APK`. The artifact is retained by GitHub for 30 days.

The workflow builds the current read-only research application. It does not add wallet keys, signing, order execution, or trading transactions. If the PumpPortal stream is needed, configure `PUMPPORTAL_API_KEY` in the deployment environment separately; it is intentionally not committed to the repository.
