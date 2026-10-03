---
name: ios-background-and-lifecycle
description: Handle the iOS app lifecycle and background execution correctly — scene states and scenePhase, why a suspended app runs no code, BGTaskScheduler, background transfer, push and local notifications with permission, silent push, deep links from notifications, and state restoration.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# iOS Background and Lifecycle

Almost every iOS background bug traces to one misconception: **a backgrounded app is suspended and runs
no code.** You do not get CPU by asking for it — you get it by declaring a background mode the system
agrees to honor, or by finishing work inside a short grace period.

1. **Know the five states and which ones run code** — `not running` → `inactive` (transient, during a transition or a system prompt) → `active` → `background` → `suspended`. Code runs in `active` and in `background` only until the system suspends you. **Suspended means zero CPU**: timers stop, sockets die, and no `didEnterBackground`-scheduled work continues.
2. **Use `scenePhase` (SwiftUI) / `UIScene` (UIKit) for app state** — `@Environment(\.scenePhase)` gives `.active` / `.inactive` / `.background`. On iOS a scene-based lifecycle is required for multi-window and is what the system actually drives; legacy `UIApplicationDelegate`-only state is a partial view of reality.
3. **Persist on `.background`, never rely on termination** — the system kills suspended apps at any time with no callback. Save state when `scenePhase` becomes `.background`; `applicationWillTerminate` is **not** reliably called and a crash or a force-quit skips it entirely. Any state that only exists in memory is state you are willing to lose.
4. **Background modes are entitlements plus `Info.plist`** — declare `UIBackgroundModes` (`audio`, `location`, `voip`, `fetch`, `processing`, `bluetooth-central`, `remote-notification`) *and* the matching capability in the target. Declaring a mode you do not legitimately use is an App Review rejection; omitting it makes the corresponding API silently do nothing.
5. **`BGTaskScheduler` is the modern background execution path** — register `BGAppRefreshTaskRequest` (short, frequent-ish) and `BGProcessingTaskRequest` (longer, typically while charging) with identifiers that must also be listed in `BGTaskSchedulerPermittedIdentifiers` in `Info.plist`. **Registration must happen before the app finishes launching**, or the launch handler is never invoked.
6. **Background scheduling is a request, not a schedule** — `submit()` asks the system; it decides when based on battery, usage patterns, and budget. There is no guaranteed interval, and a task may not run for days. Never design a feature that requires it to run at a specific time; use a push notification or a server-side job for that.
7. **Always reschedule inside the task handler** — a `BGAppRefreshTask` fires once. Call `task.setTaskCompleted(success:)` and submit the next request before returning, or background refresh silently stops forever after the first run. Set an expiration handler too, so you can cancel cleanly when the system reclaims the time.
8. **Debug background tasks by forcing a launch** — pause the app in the debugger and run `e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"<id>"]`, or `_simulateExpirationForTaskWithIdentifier:` to test the expiry path. Waiting for a real background wake during development wastes hours.
9. **`beginBackgroundTask` buys seconds, not minutes** — it gives roughly 30 seconds to finish in-flight work after backgrounding and *must* be ended with `endBackgroundTask`, or the app is terminated for exceeding its assertion. It is for finishing a write, not for long jobs.
10. **Background `URLSession` survives suspension** — `URLSessionConfiguration.background(withIdentifier:)` hands transfers to a system daemon that continues after your app is suspended or killed, delivering results through the delegate on relaunch. This is the right tool for large uploads/downloads, and the wrong tool is a normal `URLSession` task that dies with the process.
11. **Local notifications need permission and are async** — `try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])`. Without the grant, scheduling succeeds and nothing is ever shown — the classic "notifications don't work" with no error. Check `notificationSettings().authorizationStatus` before assuming a code bug.
12. **Show notifications while in the foreground explicitly** — implement `UNUserNotificationCenterDelegate.userNotificationCenter(_:willPresent:)` and return `[.banner, .sound, .list]`. Returning nothing (or the deprecated `.alert`) suppresses the banner while the app is open, which reads as "notifications are broken".
13. **Remote push needs the entitlement, the delegate, and a real device** — the `aps-environment` entitlement plus `registerForRemoteNotifications()`; the device token arrives in `didRegisterForRemoteNotificationsWithDeviceToken` (`didFailToRegister` is where a missing entitlement shows up). The simulator can receive pushes via `xcrun simctl push booted <bundleId> payload.json`, which is the fast way to test handling without a server.
14. **Silent push is throttled and not guaranteed** — `content-available: 1` with no `alert` wakes the app for a short window, and iOS budgets it by battery and usage. It is best-effort. Never use it as a reliable sync trigger; use it as a hint to refresh.
15. **Route notification taps through the same path as a URL** — handle `userNotificationCenter(_:didReceive:)` and forward the payload into your normal deep-link router, rather than duplicating navigation logic. Otherwise a cold launch from a notification lands on the wrong screen or the root.
16. **Cold launch from a notification is a different code path** — the app was not running, so any state the tap handler assumes (a loaded session, a cached list) may not exist yet. Decide explicitly whether to defer navigation until the app is ready.
17. **State restoration is opt-in and per-scene** — UIKit: `NSUserActivity` (`stateRestorationActivity`) plus `.activityContinuation`; SwiftUI: `@SceneStorage` for small per-scene values and your own persistence for real data. Test it by backgrounding, force-quitting, and relaunching — a restore path that only works when the system keeps the process alive is not restoration.
18. **Location, audio, and VoIP background modes have their own rules** — continuous location requires `allowsBackgroundLocationUpdates` and a real justification; background audio needs an active audio session with the right category; VoIP pushes require CallKit and are not a general-purpose wake mechanism. App Review rejects misused modes.
19. **Timers and `DispatchQueue` work do not survive suspension** — a repeating `Timer` scheduled before backgrounding does not fire while suspended and does not "catch up" on resume. Use `BGTaskScheduler`, background `URLSession`, or a push instead of assuming a timer keeps the app alive.
20. **Verify lifecycle behavior by actually cycling it** — background the app, wait, foreground it, and assert the state survived; force-quit and relaunch to test the restore path; send a `simctl push` in both foreground and background. Driving the state transitions is the only way to find these bugs — the code reads identically whether or not it works (see `ios-verification`).

## Related skills

- `ios-verification` — driving the state transitions and proving they behave.
- `ios-app` — building, installing, and driving the simulator/device these states occur on.
- `swiftui` — `scenePhase`, `@SceneStorage`, and `@Environment` in the view layer.
- `ios-testing` — `XCUIApplication` can background/foreground the app to test lifecycle paths.
- `mobile-app-debugging` — hangs, watchdogs, and crashes that surface during transitions.
- `observability` — logging the lifecycle transitions you need to reconstruct a field bug.
