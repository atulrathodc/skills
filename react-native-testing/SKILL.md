---
name: react-native-testing
description: Test React Native apps — Jest with React Native Testing Library for components, Maestro/Detox for real-device E2E, mocking native modules, and why a green suite is not runtime proof.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native Testing

Two different jobs. Conflating them is why suites go green while the app is broken.

1. **Component/logic tests → Jest + React Native Testing Library** — `jest` with the `react-native` preset, `render()` + queries (`screen.getByText`, `getByRole`, `getByLabelText`), and `fireEvent`/`userEvent`. Assert on what the user sees, not on component internals or state.
2. **Real-device E2E → Maestro or Detox** — Maestro runs YAML flows cross-platform with no native test build (`maestro test .maestro/<flow>.yaml`, `maestro studio` to record); Detox is deeper and faster in CI but needs a native build per platform and stable `testID`s. Choose the one the project already has.
3. **Native modules must be mocked in Jest** — an unmocked TurboModule throws `TurboModuleRegistry.getEnforcing(...): '<X>' could not be found`. Mock in `jest.setup.js` (`jest.mock('react-native-…')`), and keep mocks honest: a mock that returns success can hide the failure you are testing for.
4. **Async needs `await waitFor` / `findBy*`** — never `setTimeout` sleeps, which are the #1 source of flake. Prefer `findByText` (which retries) over `getByText` for anything that appears after an effect or a fetch.
5. **Don't snapshot everything** — large snapshots are approved without being read and fail on any refactor. Snapshot small, stable, intentional output; assert behavior everywhere else.
6. **E2E needs deterministic state** — seed the data, and provide a reset path (a deep link, launch argument, or dev-only reset). A flow that depends on whatever the previous run left behind is flaky by construction.
7. **Wait for animations, don't race them** — disable animations in CI (Android: `adb shell settings put global window_animation_scale 0`, plus the transition/animator scales) and `waitFor` visible outcomes instead of assuming a fixed duration.
8. **A green Jest run is NOT verification** — Jest never renders your app on a device, never touches native code, and never proves Metro serves a bundle the app can load. Completion requires driving the running app: see `react-native-verification`. E2E on a device is the strongest signal; Jest is the fastest.

## Related skills

- `react-native-verification` — the runtime proof a test suite cannot provide.
- `test-driven-development` / `test-coverage-analysis` / `regression-testing` — general practice this skill specializes.
- `mobile-app-debugging` — when a failing test and a failing device disagree.
- `react-native-performance` — perf regressions, which tests rarely catch.
