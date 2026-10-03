---
name: ios-app
description: Build, run, and debug iOS apps — Xcode workspace vs project, schemes, xcodebuild, simctl, Info.plist permissions and ATS, CocoaPods/SPM, signing, and crash logs.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# iOS App

Swift/SwiftUI/UIKit specifics for getting an app to build, launch, and behave on a simulator or device.

1. **Open the workspace when pods are used** — with CocoaPods present, `.xcworkspace` is the real entry point; opening the `.xcodeproj` alone builds with stale or missing pods. Newer projects may use Swift Package Manager instead — check which the project actually uses before running `pod install`.
2. **Know the target and scheme** — a workspace has multiple targets/schemes; building the wrong one produces a confusing success and no app. `xcodebuild -list` names them; build with `xcodebuild -workspace <X>.xcworkspace -scheme <Scheme> -destination 'platform=iOS Simulator,name=<Device>' build` and add `-derivedDataPath ./build` so you can find the `.app`.
3. **Run and verify with `simctl`, not by watching Xcode** — `xcrun simctl list devices booted`, `xcrun simctl boot "<name>"` + `open -a Simulator`, `xcrun simctl install booted <App.app>`, `xcrun simctl launch booted <bundleId>`, `xcrun simctl io booted screenshot /tmp/shot.png`. Logs: `xcrun simctl spawn booted log stream --predicate 'processImagePath CONTAINS "<AppName>"'`.
4. **Permissions live in `Info.plist` and fail loudly** — `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSMicrophoneUsageDescription`, etc. A missing usage string is an immediate crash the first time the API is called — never a prompt. Plist edits require a rebuild.
5. **App Transport Security blocks plain HTTP** — an iOS app cannot call `http://` by default. Local development needs an explicit ATS exception (or `NSAllowsLocalNetworking`); production should be HTTPS. This is a classic "the API works in curl but not in the app" cause.
6. **Signing and entitlements are part of the build** — automatic signing needs a team and a matching bundle identifier; capabilities (push, HealthKit, iCloud) require entitlements that must exist in the provisioning profile. `security find-identity -v -p codesigning` lists identities; `codesign -dv --verbose=4 <App.app>` inspects a build.
7. **Read crash logs and symbolicate** — device logs live in `~/Library/Logs/DiagnosticReports` and Xcode → Window → Devices and Simulators → View Device Logs. Unsymbolicated frames need the `.dSYM` from the same build; without it a Swift crash is unreadable.
8. **Toolchain mismatches masquerade as code errors** — a deployment target below a dependency's minimum, or a Swift version mismatch, breaks `pod install`/the build with messages that have nothing to do with your code. Fix the target/toolchain, then re-diagnose.
9. **Verify on the simulator AND the device class that matters** — a SwiftUI preview is not the app (it can render while the app crashes on launch), and simulator behavior diverges on networking, performance, and device-only frameworks. Launch the built app, drive the feature, screenshot it (see `mobile-app-debugging`, `runtime-verification`).

## Related skills

- `mobile-app-debugging` — crash triage, symbolication, release-vs-debug failures.
- `mobile-store-release` — App Store submission, provisioning, and review rules.
- `react-native-app` / `flutter-app` — when the iOS build is really driven by a cross-platform toolchain.
- `dependency-install-recovery` — when `pod install` or SPM resolution fails.
