---
name: react-native-verification
description: PROVE a React Native app actually works on a simulator, emulator, or device — bundle builds, app launches, no red box, the real UI flow is driven, and the backend round-trips. Jest passing or a successful build is not verification.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native Verification

**A React Native app is not verified because it compiled, bundled, or passed Jest.** Jest runs in Node — it never renders your app. Prove it on a real target: simulator, emulator, or device.

1. **Identify the project shape first** — Expo (`app.json` + `expo` dep, no native dirs), Expo prebuild/CNG, or bare RN CLI (`ios/` + `android/` present). Managed → `npx expo start`; bare → `npx react-native start`. Never assume the commands — read `package.json` scripts and `app.json`.
2. **Prove the JS bundle actually builds** — liveness: `curl -s http://localhost:8081/status` → `packager-status:running`. Compile proof: `curl -s -o /tmp/b.js -w "%{http_code}" "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false"`. **200 + JS = the whole module graph resolved; 500 + `{"type":"TransformError"}` is a red box you have not seen yet.** Expo Router projects may serve `/.expo/.virtual-metro-entry.bundle` — copy the URL Metro actually logs instead of hardcoding.
3. **Have a real target running** — iOS: `xcrun simctl list devices booted` (boot with `xcrun simctl boot "<name>"` + `open -a Simulator`). Android: `adb devices` (empty, `offline`, or `unauthorized` = no usable device; start an AVD with `emulator -avd <name>`). Verify on the platform the task named, not whichever one is convenient.
4. **Install and launch the ACTUAL build** — iOS: `xcrun simctl install booted <App.app>` then `xcrun simctl launch booted <bundleId>`. Android: `adb install -r <app>.apk` then `adb shell am start -n <pkg>/.MainActivity`. Confirm the process is alive (`adb shell pidof <pkg>`, `xcrun simctl listapps booted`). "The build succeeded" is not "the app is running".
5. **Read the real logs for the red box** — JS errors never show up in curl output:
   - Android: `adb logcat -s ReactNativeJS:V ReactNative:V AndroidRuntime:E *:S`
   - iOS sim: `xcrun simctl spawn booted log stream --predicate 'processImagePath CONTAINS "<AppName>"'`
   A launched app sitting on a red box (`Unable to resolve module`, `undefined is not an object`, `Invariant Violation`) is a FAILED verification, not a pass.
6. **Know the classic failures** — "Unable to load script / No bundle URL present" → Metro down or the device can't reach it: `adb reverse tcp:8081 tcp:8081` for Android, and on a physical device use the LAN IP or `--tunnel`, never `localhost`. "Unable to resolve module X" → missing dep or stale cache (`npx react-native start --reset-cache` / `npx expo start -c`). "React Native version mismatch" → stale bundle or duplicate `react-native`. New native module → rebuild, a reload will never pick it up.
7. **Drive the real UI — a screenshot of the home screen proves nothing** — automate the flow: Maestro (`maestro test .maestro/<flow>.yaml`) or Detox (`npx detox test -c ios.sim.debug`); jump straight to the screen under test with a deep link (`xcrun simctl openurl booted "<scheme>://<path>"` / `adb shell am start -a android.intent.action.VIEW -d "<scheme>://<path>"`). Capture evidence: `xcrun simctl io booted screenshot /tmp/ios.png`, `adb exec-out screencap -p > /tmp/android.png`.
8. **Verify the backend round-trip through the app** — the app must reach the real API and you must see the response in the app (rendered data, or its log line), not just "the request was sent". `localhost` means different things per target: iOS simulator → the host; Android emulator → `10.0.2.2` or `adb reverse tcp:<apiPort> tcp:<apiPort>`; physical device → the machine's LAN IP. `localhost` on a device is the device — the #1 "works in curl, fails in the app" cause (see `frontend-backend-integration`).
9. **Re-verify after every fix, on a fresh build** — JS-only fix: reload Metro (`r`) and re-drive. Native or config fix (`app.json`, Podfile, Gradle, a native dep): `cd ios && pod install`, then REBUILD and reinstall — reloading a JS bundle can never pick up a native change. Kill the stale Metro first; it caches.

**Never** call `done()` on a green Jest run, a successful `expo export`/Gradle build, or a bundle that returns 200. State, from real observations: the app is installed and launched on the target, its logs show no red box, the requested flow was driven end-to-end, and the data round-tripped — with a screenshot or flow output to show it.

## Related skills

- `react-native-app` — build/run specifics, Metro, native rebuild vs JS reload.
- `runtime-verification` — the language-agnostic completion mandate: it must RUN and respond.
- `mobile-app-debugging` — when it launches but crashes, hangs, or shows a red box you can't explain.
- `react-native-testing` — Jest/RNTL and Maestro/Detox, and why a green suite isn't runtime proof.
- `http-api-testing` / `frontend-backend-integration` — proving the API contract the app is fighting.
