---
name: mobile-store-release
description: Ship a mobile app to the App Store and Google Play — signing and provisioning, versioning, privacy and data-safety declarations, review rejection causes, staged rollout, and crash symbol retention.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Mobile Store Release

Stores enforce rules that have nothing to do with whether your code works. Most rejected releases fail on paperwork, not bugs.

1. **Signing material is permanent — back it up outside the repo** — an Android upload keystore that is lost means you can never update that listing again (Play App Signing can mitigate, not undo). iOS needs a distribution certificate plus a provisioning profile. Keep keystores, `.p12`, and store API keys in a secret manager, never in git.
2. **Version and build numbers are separate and both matter** — the marketing version (`1.4.0`) can repeat across uploads; the build number / `versionCode` must strictly increase. Every store reject-and-resubmit needs a NEW build number; reusing one is the most common "upload rejected" cause.
3. **Declare data honestly, once, in the store console** — Apple's App Privacy answers and Google's Data safety form must match what the app and its SDKs actually collect. Analytics/ad SDKs collect on your behalf, so a wrong answer here is a policy violation that can pull a live app, not just a rejected build.
4. **Permissions need a stated purpose** — each sensitive permission (`Info.plist` usage strings; Android manifest + runtime) must be explained in user-facing copy, and the feature must be reachable. Reviewers reject apps requesting permissions nothing uses.
5. **Account-based apps need an account-deletion path** — Apple requires in-app deletion for apps that support account creation; a "contact support to delete" flow gets rejected. Sign-in must also offer a working demo account for review if the app is gated.
6. **Keep `targetSdk` and the deployment target current** — Play rejects uploads below its required target API level, and Apple requires building against a recent SDK. Bump deliberately and re-test behavior changes (storage, notifications, background execution).
7. **Test the exact artifact you submit** — install the store-format build (`.aab` on Play, TestFlight/`.ipa` on iOS) and run the critical flow there. Minification, obfuscation, stripped logging, and ATS/cleartext rules make release builds behave differently from debug (`mobile-app-debugging`).
8. **Retain symbol artifacts per release, forever** — iOS `.dSYM` and Android `mapping.txt` are the only way to read a production crash. Archive them alongside the release, keyed by build number; you cannot regenerate them for a shipped binary.
9. **Stage the rollout and watch it** — phased/staged release to a small percentage first, with crash reporting and the store's vitals dashboard. On a bad release, pause the rollout rather than shipping a fix and hoping; know whether your stack supports pulling a staged Android release (iOS cannot be un-shipped).
10. **Prove the shipped binary actually runs** — the release train ends with an install on a real device and the feature verified (see `runtime-verification`, `react-native-verification`). "Uploaded successfully" and "approved" are not "works".

## Related skills

- `react-native-deployment` / `flutter-app` / `ios-app` / `android-app` — the build side of each stack.
- `mobile-app-debugging` — reading the crashes that come back from production.
- `secret-management` — storing signing material and store credentials.
- `ci-cd-troubleshooting` — automating builds and submissions.
