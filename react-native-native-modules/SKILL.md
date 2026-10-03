---
name: react-native-native-modules
description: Add and debug native code in React Native — Expo config plugins and prebuild, pod install and Gradle, permissions, New Architecture compatibility, and when a rebuild is mandatory.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native Native Modules

Anything that touches the OS — camera, Bluetooth, secure storage, notifications, biometrics — crosses the JS/native boundary. This is where "it worked in Expo Go" ends.

1. **Native config lives in the config, not the native folders** — in an Expo (CNG) project, `ios/` and `android/` are GENERATED. Change `app.json`/`app.config.*` and plugin entries, not the generated files; `npx expo prebuild --clean` will overwrite your hand edits.
2. **Install native libraries with the SDK-aware installer** — `npx expo install <pkg>` picks the version matching your SDK. Plain `npm install` happily pulls a newer major that breaks the build. Read what it selected.
3. **A native change requires a REBUILD** — after adding a library with native code, changing permissions, or editing plugin config: `npx expo run:ios` / `npx expo run:android` (or `npx react-native run-*`), plus `cd ios && pod install`. Metro's reload only replaces the JS bundle; it will never load new native code.
4. **Expo Go cannot load custom native code** — if the app depends on a third-party native module or a config plugin, it needs a dev build (`expo-dev-client` + `expo run:*`, or EAS). "It works in Expo Go" is not evidence for the dev build and vice versa.
5. **Permissions are declared in TWO places** — iOS `Info.plist` usage strings (`NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, …) and Android `AndroidManifest.xml`. A missing iOS usage string is an instant crash the moment the API is called, not a prompt — and Android needs the runtime request too (`PermissionsAndroid` / `expo-permissions`-style), including `POST_NOTIFICATIONS` on Android 13+.
6. **New Architecture is the default and the legacy path is gone** — RN 0.76+ ships Fabric/TurboModules, and current Expo SDKs (55+) removed the legacy architecture entirely. A native library without New Architecture support fails to build or crashes at runtime: check its compatibility and version BEFORE adding it, and prefer a maintained alternative over a pin that fights the toolchain.
7. **When the native build fails, clean before you re-diagnose** — `cd android && ./gradlew clean` (add `--stacktrace` for the real cause); delete `ios/Pods` + `Podfile.lock` and re-run `pod install`. Read the FIRST error — a CocoaPods or Gradle failure cascades and the last lines are usually noise.
8. **Verify on the device, not in the import** — "the module imported" proves nothing. Call the API and observe the real result on a target: the permission prompt appears, the denial path is handled without crashing, and the returned data is correct (see `react-native-verification`, `mobile-app-debugging`).

## Related skills

- `react-native-app` — the build/run loop and the rebuild-vs-reload distinction.
- `react-native-verification` — proving the native capability works on a real target.
- `mobile-app-debugging` — native crashes, symbolication, and "works in debug, fails in release".
- `dependency-install-recovery` / `ios-app` / `android-app` — toolchain-level fixes.
