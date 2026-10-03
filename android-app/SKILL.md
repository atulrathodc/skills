---
name: android-app
description: Build, run, and debug Android apps — Gradle tasks, AndroidManifest, adb and emulators, runtime permissions, cleartext/network config, R8 mapping and ANRs, and target API level rules.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Android App

Kotlin/Compose/Gradle specifics for getting an app to build, install, and run on an emulator or device.

1. **Always use the Gradle wrapper** — `./gradlew assembleDebug`, `./gradlew installDebug`, `./gradlew bundleRelease`. Never a system `gradle`. Add `--stacktrace` the moment a build fails; the friendly summary hides the real cause.
2. **The manifest is a contract, not boilerplate** — every activity/service must be declared; a launcher activity needs the `MAIN`/`LAUNCHER` intent filter and `android:exported="true"` (required since API 31 — omitting it is a build/install failure). Permissions are declared here AND requested at runtime.
3. **`adb` is the whole toolchain for verification** — `adb devices` (empty / `offline` / `unauthorized` = no usable device), `adb install -r <app>.apk`, `adb shell am start -n <pkg>/.MainActivity`, `adb shell pidof <pkg>`, `adb exec-out screencap -p > /tmp/s.png`, `adb logcat -s AndroidRuntime:E ReactNativeJS:V *:S`. Pass `-s <serial>` when more than one device is attached.
4. **Emulators need explicit lifecycle management** — `emulator -list-avds`, `emulator -avd <name>`; a corrupt or stale emulator state is fixed by a cold boot (`-no-snapshot-load`) or a wipe, not by reinstalling the app. `adb reverse tcp:<port> tcp:<port>` maps a device port back to your host — required for `localhost` APIs and Metro.
5. **Cleartext HTTP is blocked by default (API 28+)** — an app calling `http://` fails silently-ish until you add a network security config permitting it for development. Production should be HTTPS.
6. **Permissions are two steps** — manifest declaration plus a runtime request; a denied permission must have a handled path (the app crashing or hanging on denial is the bug). Android 13+ requires `POST_NOTIFICATIONS` explicitly, and recent versions restrict media/location access further.
7. **Release builds behave differently** — R8/ProGuard strips and renames code, so reflective access and serialization break unless kept; you must retain `mapping.txt` per release to symbolicate crashes. `isMinifyEnabled` and debug-only logging differences explain most "works in debug, crashes in release" reports.
8. **ANRs are main-thread blocking, not crashes** — network, disk, or heavy parsing on the main thread freezes the UI; get traces with `adb bugreport` (or the Play Console ANR report) and move the work to a background dispatcher/thread.
9. **`targetSdk` is enforced by Play** — uploads below the current required target API level are rejected, and behavior changes follow `targetSdk` (background location, exact alarms, storage). Bump it deliberately and re-test, not as a version-string edit.
10. **Verify on a device** — install the built artifact, launch it, drive the flow, and read `logcat` for exceptions (`mobile-app-debugging`, `runtime-verification`). "Gradle build successful" says nothing about whether the app runs.

## Related skills

- `mobile-app-debugging` — logcat triage, symbolication, ANRs, release-only failures.
- `mobile-store-release` — Play submission, signing, Data safety, target API level.
- `ios-app` — the equivalent iOS toolchain.
- `react-native-app` / `flutter-app` — when Gradle is driven by a cross-platform toolchain.
