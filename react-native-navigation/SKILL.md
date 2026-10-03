---
name: react-native-navigation
description: React Native routing — Expo Router (file-based) vs React Navigation, registering screens, params, deep links, tabs/stacks, and the blank-screen failures caused by both.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native Navigation

Two systems, opposite models. Pick the one already in the project — never introduce the second.

1. **Detect which one this app uses** — `expo-router` in `package.json` = file-based routing (`app/` directory, one file per route). `@react-navigation/*` = component-based (a `<NavigationContainer>` with `Stack`/`Tab` navigators declared in code). Grep before writing any screen.
2. **Expo Router: the file path IS the route** — `app/index.tsx` → `/`, `app/settings.tsx` → `/settings`, `app/(tabs)/profile.tsx` → `/profile` (parentheses = a group, not a URL segment). Layouts are `_layout.tsx`; nesting a folder under a `_layout` nests the navigator.
3. **Expo Router: every route file must `export default`** — a route with only named exports renders a blank screen with no error. This is the single most common "navigation is broken" cause.
4. **React Navigation: screens must be registered** — a component not passed to a `<Stack.Screen>` never mounts, so `navigate("Foo")` silently does nothing. Check the navigator, not the component.
5. **Params are strings on the way in** — deep links and route params arrive as strings; parse numbers/dates explicitly and validate. Use `useLocalSearchParams()` (Expo Router) or `route.params`; don't pass non-serializable objects between screens — pass an id and read the entity, or navigation state stops being restorable.
6. **Native deps behind navigation** — `react-native-screens` and `react-native-safe-area-context` must be installed and the app REBUILT (they are native). Missing `react-native-screens` shows as crashes on push or a blank stack, not a tidy error.
7. **Deep links: prove them, don't assume them** — Expo Router derives links from the file tree plus `scheme` in `app.json`; React Navigation needs an explicit `linking` config mapping each path to a screen. Test the real thing: `xcrun simctl openurl booted "<scheme>://<path>"` / `adb shell am start -a android.intent.action.VIEW -d "<scheme>://<path>"`. A wrong scheme or a missing config silently opens the app to the home screen.
8. **Android hardware back is not iOS back** — nested navigators swallow back presses; handle with `BackHandler` (or `useFocusEffect`) when a screen must intercept it. Test back on Android specifically; iOS has no equivalent gesture failure.
9. **Verify by navigating for real** — drive the route in a running build (see `react-native-verification`): a screen that "should" render but shows blank means an unregistered screen, a missing `default export`, or a navigator that never mounted. Confirm with a screenshot of the destination, not the tap.

## Related skills

- `react-native-verification` — proving the route renders on a real device rather than "the file exists".
- `react-native-ui-styling` — headers, safe areas, and keyboard interaction with navigators.
- `react-native-app` — the rebuild step native navigation deps require.
- `state-management` — cross-screen state vs navigation params.
