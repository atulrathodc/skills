---
name: flutter-app
description: Build, run, and debug Flutter apps — flutter doctor, pub, devices, hot reload vs hot restart, analyze/test, DevTools profiling, native plugin rebuilds, and release symbolication.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Flutter App

Dart/Flutter specifics whose failure modes do not look like React Native's, even though both are cross-platform.

1. **Run `flutter doctor -v` first when anything is broken** — it names the actual problem (missing Android SDK, unaccepted Xcode licence → `sudo xcodebuild -runFirstLaunch`, no CocoaPods, wrong Java). Chasing a build error before doctor is wasted turns.
2. **Mind the reload ladder** — `r` = hot reload (re-runs `build()`), `R` = hot restart (re-runs `main()`, resets state). Hot reload does NOT re-run `initState` on existing widgets or pick up changes to `main()`, static initializers, or native code. If a state change "didn't apply", it is almost always this.
3. **Native changes need a full rebuild** — adding a plugin, editing `AndroidManifest.xml`, `Info.plist`, Gradle, or the Podfile is invisible to hot reload. Stop, `cd ios && pod install` for iOS, and re-run; a plugin that isn't wired shows as a `MissingPluginException` at call time.
4. **Pin and resolve dependencies explicitly** — `flutter pub get` to install, `flutter pub outdated` to see what's stale, `dart pub upgrade`/`--major-versions` to move. A version solve that changed silently is a common cause of "it broke with no code change".
5. **Static checks catch what tests don't** — `flutter analyze` (treat warnings as real), `dart format`, then `flutter test` for widget tests (`pumpWidget` + `pumpAndSettle`) and `integration_test` for on-device flows. Tests run on the Dart VM — they do not prove the app builds or launches.
6. **Widget tests have their own rhythm** — `await tester.pump()` for a frame, `pumpAndSettle()` to drain animations and microtasks; forgetting the `await` produces assertions about the widget tree that look like logic bugs.
7. **Debug and profile, don't eyeball perf** — `flutter run --profile` plus DevTools (frame timings, rebuild counts, memory) is the honest measurement. Debug mode is far slower than release; never conclude "the app is slow" from a debug run.
8. **Symbolicate release crashes** — builds made with obfuscation need `--split-debug-info` artifacts and `flutter symbolize -i <stack> -d <debug-info-dir>`. Without them, a production stack trace is unreadable.
9. **The usual build traps** — stale generated code: `flutter clean` then `flutter pub get` before re-diagnosing; a plugin whose native `minSdk`/iOS deployment target exceeds yours; and Gradle/CocoaPods version drift. Read the FIRST error, not the cascade.
10. **Verify on a real target** — `flutter devices`, `flutter run -d <id>`, then drive the actual screen and capture evidence (`flutter screenshot`, or the platform screenshot tools). A green `flutter test` and a clean `flutter analyze` are not a running app.

## Related skills

- `mobile-app-debugging` — Dart exceptions vs native crashes vs hangs, and symbolication.
- `ios-app` / `android-app` — the native toolchains Flutter drives underneath.
- `mobile-store-release` — building for and shipping to the stores.
- `react-native-verification` — the same completion standard, applied to Flutter.
