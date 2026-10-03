---
name: react-native-deployment
description: Ship React Native apps — EAS build/submit/update, versioning and build numbers, signing credentials, OTA updates and runtimeVersion, and store review gotchas.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native Deployment

A successful build is not a shipped app. Stores reject, OTA updates skip silently, and credentials are unrecoverable.

1. **Versioning is two numbers per platform** — user-facing `expo.version` (semver) plus `ios.buildNumber` and `android.versionCode`, each of which must strictly increase or the store rejects the upload. Bump them in `app.json`/`app.config.*` — one place — and never reuse a build number.
2. **Build with EAS (or the native toolchain) — don't improvise** — `eas build -p ios|android --profile production`, with profiles declared in `eas.json` (development / preview / production). Keep `eas.json` in version control; it is part of the build contract.
3. **OTA updates only carry JS (and assets)** — EAS Update ships a new bundle to an installed binary. Any native change (a native dependency, a permission, a config plugin) requires a NEW BINARY. The update is matched on `runtimeVersion`, so a mismatched binary silently keeps running the old bundle — the #1 "my update didn't apply" cause. Set the runtime version policy deliberately and confirm the running app reports the update you published.
4. **Credentials are the thing you cannot lose** — Android keystores are effectively permanent: losing one means you cannot update the app under the same listing. Back them up outside the repo (EAS can manage/store them). iOS needs a distribution certificate + provisioning profile, with device UDIDs registered for ad-hoc builds. Never commit keystores, `.p12`, or signing secrets.
5. **Store review is a checklist, not a formality** — iOS requires a privacy policy, accurate App Privacy answers, declared permission purposes, and an in-app account-deletion path for accounts; placeholder/"beta"-looking builds and broken demo logins get rejected. Android requires the Data safety form, correct permission declarations, and a recent `targetSdk` (Play rejects uploads below the current required target API level — check the requirement before each release, it rises every year).
6. **Release-only failures are the norm** — minification/obfuscation, stripped logs, ATS/cleartext blocking, tree-shaken code paths, and Hermes bytecode differ from debug. If a bug only appears in the release artifact, reproduce against a release build (see `mobile-app-debugging`).
7. **Tag the exact commit you shipped** — `git tag` the release, and keep the build number ↔ commit mapping. Without it, "which code is in production" is unanswerable, and rollback becomes guesswork.
8. **Verify the artifact, not the build log** — install the produced `.ipa`/`.apk`/`.aab` on a real device (TestFlight / internal track / `adb install`), launch it, and confirm the feature works — a green `eas build` has shipped many crashing apps. Then follow `react-native-verification`. For an OTA update, confirm the new bundle is actually running and know your rollback (`eas update:rollback`) before you publish.

## Related skills

- `mobile-store-release` — the store/signing rules that apply to any mobile stack.
- `react-native-verification` — proving the shipped binary actually runs.
- `mobile-app-debugging` — release-only crashes and symbolication.
- `secret-management` — handling signing material and API keys.
- `ci-cd-troubleshooting` — when the build pipeline, not the app, is broken.
