---
name: react-native-app
description: Build, run, and debug React Native apps — Expo vs bare CLI, Metro bundler, native rebuild vs JS reload, simulator/emulator, localhost-vs-host networking.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native App

React Native specifics that trip up agents. The app runs on a device, not in your shell — building it is only half the job (see `react-native-verification`).

1. **Expo vs bare RN — read before you run.** `app.json` / `app.config.(js|ts)` plus an `expo` dependency → Expo; `ios/` + `android/` dirs → native projects exist (bare CLI, or an Expo "prebuild"/CNG project). The commands differ: `npx expo start` vs `npx react-native start` + `run-ios`/`run-android`. Read `package.json` scripts instead of guessing.
2. **Identity you will need later** — `app.json` / `app.config.*` gives `name`, `slug`, `ios.bundleIdentifier`, `android.package`. Verify against the device rather than trusting it: `xcrun simctl listapps booted`, `adb shell pm list packages | grep <name>`.
3. **Install & native deps** — `npm install` (honor the lockfile: `yarn` / `pnpm`). iOS needs pods: `cd ios && pod install` (`npx pod-install`). Android resolves through Gradle at build time. Expo managed has no native dirs until `npx expo prebuild`.
4. **Metro is the dev loop** — bundler on `:8081` (`npx expo start` / `npx react-native start`).
   - JS-only change → reload: `r` in Metro, or the dev menu (`adb shell input keyevent 82`).
   - Native change (a `react-native-*` module with native code, `app.json` native config, Podfile/Gradle, permissions, Hermes or New Architecture toggles) → **rebuild**: `npx expo run:ios` / `npx expo run:android` / `npx react-native run-ios|run-android`. A JS reload can NEVER pick up native code.
   - Expo Go cannot load a custom native module — that needs a dev build (`expo-dev-client` + `expo run:*`, or EAS).
5. **`localhost` is not the host machine** — the app runs on the device/emulator. iOS simulator → `localhost` reaches the host. Android emulator → `10.0.2.2`; any Android target → `adb reverse tcp:8081 tcp:8081` (add `tcp:<apiPort>` for the backend). Physical device → the machine's LAN IP, or `npx expo start --tunnel`. This is the #1 "works in curl, fails in the app" cause (see `frontend-backend-integration`).
6. **API config** — Expo: `EXPO_PUBLIC_*` vars are inlined at bundle time, so restart Metro after changing them. Bare: `react-native-config` / `.env` or a platform-split constant. Keep the base URL in one place per platform.
7. **Cache and version traps** — stale Metro cache produces phantom "Unable to resolve module X": `npx react-native start --reset-cache` / `npx expo start -c`. Gradle/pods cache too: `cd android && ./gradlew clean`; delete `ios/Pods` + `Podfile.lock` and reinstall. A duplicate or mismatched `react` / `react-native` version shows as a red box at launch — align versions and dedupe.
8. **Verify the build is real, then hand off** — Metro alive (`curl -s http://localhost:8081/status` → `packager-status:running`), the bundle transforms (`curl` the `index.bundle?platform=...` URL → 200, not a 500 `TransformError` JSON), the app installs and launches on a simulator/emulator. "Gradle succeeded" or "the bundle exported" is NOT done — follow `react-native-verification` to prove the running app works.

## Related skills

- `react-native-verification` — prove the running app works on a simulator, emulator, or device.
- `runtime-verification` / `ui-verification` / `make-it-run` — the completion mandate: it must RUN and respond.
- `frontend-backend-integration` — matching the app's API calls to the backend contract.
- `dependency-install-recovery` / `startup-failure-recovery` — when install or launch fails.
