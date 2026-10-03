---
name: ios-testing
description: Test iOS apps — XCTest and Swift Testing for unit tests, XCUITest for real UI automation, accessibility identifiers, deterministic launch state, async waits that don't flake, network stubbing, and why a green suite is not runtime proof.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# iOS Testing

Two different jobs, two different frameworks, and conflating them is why a suite goes green while the
app is broken. Unit tests prove logic; only a UI test proves the app works.

1. **Unit tests → XCTest, or Swift Testing on Xcode 16+** — Swift Testing (`import Testing`, `@Test func …`, `#expect(x == y)`, `#require`) is the modern framework with better async and parameterized-test support. XCTest is still required for UI tests and for anything using `XCTestCase` lifecycle hooks. Match whichever the project already uses rather than migrating mid-task.
2. **UI tests → XCUITest, driving a real app process** — `XCUIApplication()` launches the actual app and queries elements through the accessibility layer. This is the only test type that exercises launch, navigation, and rendering. It is also slow and the most flake-prone, so keep it to the critical flows.
3. **Run them with `xcodebuild`, not by clicking Xcode** — `xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16' -resultBundlePath /tmp/Test.xcresult`. Add `-only-testing:<Target>/<Class>/<method>` to run one test. The `.xcresult` bundle holds the failures, logs, and screenshot attachments.
4. **Accessibility identifiers are the test's API contract** — set `.accessibilityIdentifier("submitButton")` and query `app.buttons["submitButton"]`. A missing identifier fails at runtime, not compile time, so a renamed view breaks tests silently. Prefer identifiers over querying by visible label, which changes with copy and localization.
5. **Querying an element forces a snapshot and can be slow** — `app.buttons["x"].exists` walks the tree. Cache the query in a property and reuse it; do not re-query inside a loop over many cells.
6. **Launch arguments are how you get a deterministic app** — `app.launchArguments = ["-uiTesting", "-resetState"]` and read them in the app to reset `UserDefaults`, seed a fixture store, or inject a stub base URL. A UI test that depends on whatever the last run left in the container is flaky by construction.
7. **Kill animations in test builds** — `UIView.setAnimationsEnabled(false)` when `-uiTesting` is present, and `waitForExistence(timeout:)` / `XCTWaiter` rather than `sleep`. A hard `sleep(2)` is the single largest source of iOS test flake; wait on the *condition* instead.
8. **Async assertions use expectations, never sleeps** — XCTest: `await fulfillment(of: [exp], timeout: 5)` (the `wait(for:)` form deadlocks on the main thread in async tests) or Swift Testing's `confirmation`. Assert the outcome you need, with a bounded timeout that fails loudly.
9. **Reset state between tests, in the app or the harness** — `UserDefaults.standard.removePersistentDomain(forName: Bundle.main.bundleIdentifier!)`, delete the app between runs, and clear the keychain — a keychain item survives app deletion on the simulator and is a classic hidden cross-test dependency.
10. **Stub the network at the `URLProtocol` layer** — `config.protocolClasses = [StubURLProtocol.self]` intercepts everything `URLSession` sends without touching production code, letting you test 500s, timeouts, slow responses, and malformed JSON deterministically. Protocol-inject a `APIClient` for unit tests; use `URLProtocol` when you need the real session stack.
11. **Test the error and empty paths, not just the happy one** — a list with zero items, a failed refresh, a 401 that should route to login, and a decode failure on an unexpected payload. These are where iOS apps actually break, and they are the cheapest tests to write once the stub layer exists (see `test-coverage-analysis`).
12. **Test on the OS version and device class you support** — behavior differs across iOS versions and between simulator and device (keyboard, safe area, performance, and hardware-only frameworks). A simulator-only suite misses device-only failures entirely (`mobile-app-debugging`).
13. **Use a test plan for configurations** — `.xctestplan` selects which tests run, with which launch arguments and environment, per configuration (e.g. mock network vs live backend). It is also where you enable parallelization and code coverage deliberately rather than by accident.
14. **Parallel testing needs isolation** — `-parallel-testing-enabled YES` runs tests across simulator clones concurrently, which exposes any shared state (a fixed file path, a shared `UserDefaults` key, a real backend) as flake. Unit tests usually parallelize cleanly; UI tests often need it off.
15. **Coverage measures execution, not verification** — a covered line that asserts nothing proves nothing, and SwiftUI view bodies inflate the number for free. Read coverage to find *unexecuted* important paths, not to score the suite (`test-coverage-analysis`).
16. **A green unit suite is NOT runtime proof** — it never launches the app, never renders a view, and never proves the build installs and runs on a device. Completion requires driving the running app (`ios-verification`). Test results and a verified app are two separate pieces of evidence.
17. **Attach evidence on failure** — `XCTAttachment` screenshots and the automatic UI-test failure screenshots in the `.xcresult` are what let you diagnose CI-only failures. Without them a red build in CI is a guess.

## Related skills

- `ios-verification` — the runtime proof a green suite cannot provide.
- `ios-app` — building, installing, and launching the app the tests drive.
- `mobile-app-debugging` — when a failing test and a failing device disagree.
- `ios-performance` — `XCTMetric`/signpost-based performance regression tests.
- `test-driven-development` / `regression-testing` / `test-coverage-analysis` — the general practice this specializes.
- `react-native-testing` — the cross-platform equivalent, if the app is not native.
