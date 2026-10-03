---
name: mobile-app-debugging
description: Debug a mobile app that crashes, hangs, or misbehaves on iOS/Android/Flutter/React Native — get the real log, classify the failure, symbolicate, and tell debug-only from release-only and simulator-only from device-only.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Mobile App Debugging

Mobile bugs are hard because the failure is on a device you cannot see. Get the log before you change code.

1. **Reproduce it on the platform and build type that failed** — a crash on a physical iPhone is not reproduced by a debug build on an Android emulator. Match device class, OS version, and DEBUG vs RELEASE; if you cannot reproduce, say so rather than guessing at a fix.
2. **Classify the failure first — the three kinds have different tools:**
   - **Language exception** (JS / Dart / Kotlin / Swift): a stack trace with your code in it. React Native: `adb logcat -s ReactNativeJS:V`; Flutter: `flutter logs` / the `flutter run` console.
   - **Native crash** (SIGSEGV/SIGABRT, no JS frame): OS crash log, needs symbolication. iOS `~/Library/Logs/DiagnosticReports` and Xcode → Devices and Simulators → View Device Logs; Android `adb logcat -b crash` and the Play Console crash report.
   - **Hang / ANR** (frozen UI, no crash): Android ANR traces via `adb bugreport`; iOS watchdogs and main-thread hangs via Instruments. A hang is a blocking main thread, not an exception.
3. **Read the FIRST error, not the last line** — the tail is usually cascade noise ("Build failed", "Something went wrong"). The first `FATAL EXCEPTION`, `Fatal error`, `SIGABRT`, or `Unhandled` frame names the cause.
4. **Symbolicate before you theorize** — obfuscated or compiled frames are unreadable by design. iOS needs the matching `.dSYM`; Android needs the R8/ProGuard `mapping.txt` from that exact build; Flutter needs `flutter symbolize` with the `--split-debug-info` data. Keep those artifacts per release — without them, you cannot read your own production crashes.
5. **"Works in debug, breaks in release" → minification, obfuscation, or stripped code** — R8 removing reflectively accessed classes, assertions and logs compiled out, Hermes bytecode, ATS/cleartext blocking, tree-shaken paths. Reproduce against a RELEASE build before theorizing about logic.
6. **"Works on simulator, breaks on device" → something device-only** — missing `Info.plist` usage string (instant crash on first API call), missing entitlement or provisioning, real network/TLS instead of the simulator's host `localhost`, architecture/ABI mismatches, or hardware features the simulator fakes.
7. **Attach a debugger instead of guessing** — Xcode LLDB, Android Studio "Attach to Process" (or `adb shell am set-debug-app -w <pkg>` to break at launch), Flutter DevTools, React DevTools. One breakpoint beats ten speculative edits.
8. **Bisect the boundary, don't read everything** — put a log at the JS↔native, Dart↔platform, or app↔API edges and find which side of the line the value is already wrong on. Then read only that side.
9. **Never "fix" it by swallowing the error** — a `try/catch` that hides a stack, a blanket retry, or a null check that masks a missing value turns a loud failure into a silent one. Fix the root cause and keep the log.
10. **Verify on the failing configuration** — re-run the exact platform/build/device that reproduced it, and confirm the crash log is clean (see `runtime-verification`, `react-native-verification`). A fix verified only on the simulator that never reproduced the bug is unverified.

## Related skills

- `systematic-debugging` / `test-failure-analysis` — the general method this skill specializes.
- `ios-app` / `android-app` / `flutter-app` / `react-native-verification` — platform-specific tooling.
- `mobile-store-release` — where production crash reports and their mapping files come from.
- `observability` — capturing the logs you will wish you had.
