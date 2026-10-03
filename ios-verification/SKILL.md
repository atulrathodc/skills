---
name: ios-verification
description: PROVE an iOS app actually works on a simulator or device — build the real product, install and launch it, read the device log, drive the real UI flow, and confirm the backend round-trips. A green test suite, a successful build, or a SwiftUI preview is not verification.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# iOS Verification

**An iOS app is not verified because it built, because the tests passed, or because the preview rendered.**
A SwiftUI preview can happily render a view while the app crashes on launch. Prove it on a real target:
install the built `.app`, launch it, read the log, and drive the flow the task asked for.

1. **Identify the project shape before running anything** — with CocoaPods present the `.xcworkspace` is the real entry point and opening the `.xcodeproj` builds without its pods; SPM-only projects have no workspace. Find the scheme and bundle id with `xcodebuild -list -workspace <X>.xcworkspace` and `xcodebuild -showBuildSettings -scheme <Scheme> | grep -E 'PRODUCT_BUNDLE_IDENTIFIER|BUILT_PRODUCTS_DIR'`. Never guess either.
2. **Build the actual product for a real destination** — `xcodebuild -workspace <X>.xcworkspace -scheme <Scheme> -configuration Debug -destination 'platform=iOS Simulator,name=<Device>' -derivedDataPath ./build build`. The `-derivedDataPath` matters: it puts the `.app` somewhere you can find it (`./build/Build/Products/Debug-iphonesimulator/<App>.app`) instead of buried in `~/Library/Developer/Xcode/DerivedData`.
3. **Build and launch for the target the task named** — the simulator and a device need different builds (`-destination 'platform=iOS Simulator,…'` vs `-destination 'generic/platform=iOS'` plus signing). Verifying on the simulator when the task is about a device-only feature (camera, real push, performance, Bluetooth) verifies nothing.
4. **Have a booted target first** — `xcrun simctl list devices booted`; boot with `xcrun simctl boot "<name>"` then `open -a Simulator`. For a device, `xcrun devicectl list devices` (or Xcode → Devices) and confirm it is actually connected and paired, not merely listed.
5. **Install and launch the BUILT product, not the Xcode run button** — `xcrun simctl install booted <App.app>` then `xcrun simctl launch --console booted <bundleId>`. `--console` streams the app's stdout to your terminal, which is usually where the useful message is. Running from Xcode attaches a debugger and a console that can mask a launch-time failure the user will hit.
6. **Read the device log — a launched app is not a working app** — `xcrun simctl spawn booted log stream --predicate 'processImagePath CONTAINS "<AppName>"' --level debug`. An app that launched and immediately died, is stuck on a splash screen, or is looping is a FAILED verification. Check for crash reports in `~/Library/Logs/DiagnosticReports` (simulator) and on the device under Settings → Privacy → Analytics, and symbolicate with the matching `.dSYM` (`mobile-app-debugging`).
7. **Know the two instant-crash causes on iOS** — a missing `Info.plist` usage string (`NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, …) crashes the moment the API is called, never prompts, and never logs a useful Swift frame; and a missing entitlement (network client, push, App Groups) makes the feature fail immediately. Both are config bugs that no amount of code reading reveals.
8. **Prove the backend round-trip inside the app** — ATS blocks plain `http://` by default, so an API that answers `curl` on your machine fails in the app with an opaque network error. That, plus the `localhost` confusion, is the #1 "works in curl, fails in the app" cause. On the **simulator** `localhost`/`127.0.0.1` is the host Mac and works; on a **physical device** it is the device itself, so you need the Mac's LAN IP (and an ATS exception, or HTTPS). Confirm the response is rendered in the app, not just that a request was attempted.
9. **Drive the real UI — a screenshot of the home screen proves nothing** — automate the flow with XCUITest (`ios-testing`), or drive it manually and capture each step. Jump straight to the screen under test with a deep link: `xcrun simctl openurl booted "<scheme>://<path>"`. Verify the whole requested flow end-to-end, not just that the first screen appears.
10. **Capture evidence** — `xcrun simctl io booted screenshot /tmp/shot.png` (and `xcrun simctl io booted recordVideo /tmp/flow.mp4` for motion). Make captures deterministic with `xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100 --cellularBars 4`, and clear it with `--clear`.
11. **Reset state between runs — permissions and containers persist** — a denied permission is sticky and will not re-prompt, which looks exactly like a broken feature. Reset with `xcrun simctl privacy booted reset all <bundleId>`, wipe data with `xcrun simctl uninstall booted <bundleId>`, and inspect it with `xcrun simctl get_app_container booted <bundleId> data`. A verification that only passes because of leftover state from a previous run is not a verification.
12. **Test the permission flows explicitly** — grant and deny each one and confirm the app behaves correctly both ways (`xcrun simctl privacy booted grant|revoke <service> <bundleId>`). Denial is the path that is almost never tested and almost always broken.
13. **Push notifications need a real-cycle test** — `xcrun simctl push booted <bundleId> payload.json` delivers a push without a server. Verify it appears in the **foreground** (which requires the `willPresent` delegate to return presentation options) and in the **background**, and that tapping it routes to the right screen from both a warm and a cold launch (`ios-background-and-lifecycle`).
14. **Background and foreground the app** — `xcrun simctl launch` then background it (or drive via XCUITest) and return: state must survive, in-flight work must not corrupt, and a task the app claimed to finish in the background must actually have run. A feature that only works while the app is frontmost is a bug you will otherwise ship.
15. **Exercise the platform edges the happy path skips** — rotation, dark mode, a small and a large device, Dynamic Type at the largest setting, safe-area/notch layouts, and airplane mode / a dropped connection. Each is a bug class, not a formality, and most are cheapest to check on the simulator before touching a device.
16. **Verify the Release configuration too, at least once** — optimization, stripped logging, and ATS/cleartext differences make Release builds behave differently from Debug, and "works in debug, breaks in release" is a well-known iOS failure mode. Build `-configuration Release` and run the critical flow on it before declaring the feature done.
17. **Rebuild and reinstall after any config change** — changes to `Info.plist`, entitlements, the Podfile, or anything native are **not** picked up by relaunching, and not by a JS reload in a hybrid app. `pod install` if the Podfile changed, then rebuild, reinstall, and re-drive. A verified pass on a stale binary is void.
18. **Verify on the device class that matters when the task is about a device** — simulator performance, camera, real push (APNs), Bluetooth, and hardware sensors do not reproduce there. Attach a device and repeat the flow on a real build (`mobile-store-release` for TestFlight).
19. **Re-verify from a clean state after the fix** — uninstall, rebuild, install, launch, and re-run the exact failing flow. The fix is confirmed when the originally-failing interaction now succeeds on a fresh install, not when the crash log stops appearing.

**Never** call `done()` on a green test run, a successful `xcodebuild`, a rendered preview, or an app that merely launches. State, from real observations: the app was installed and launched on the named target, its log shows no crash or error, the requested flow was driven end-to-end, and the data round-tripped — with a screenshot, recording, or test output to show it.

## Related skills

- `ios-app` — the build/run/signing mechanics this skill sequences.
- `runtime-verification` — the language-agnostic completion mandate: it must RUN and respond.
- `ios-testing` — XCTest/XCUITest automation, and why a green suite is not runtime proof.
- `ios-background-and-lifecycle` — the lifecycle paths steps 13–14 must exercise.
- `ios-performance` — measuring on the device once the flow is proven correct.
- `mobile-app-debugging` — when it launches but crashes, hangs, or shows a red box you cannot explain.
- `react-native-verification` — the cross-platform counterpart, if the app is not native.
- `http-api-testing` / `frontend-backend-integration` — proving the API contract the app is fighting.
