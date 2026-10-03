---
name: react-native-ui-styling
description: Style and lay out React Native UIs — StyleSheet rules that differ from CSS, flex defaults, safe areas, keyboard handling, platform-specific shadows, and dark mode.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# React Native UI & Styling

React Native looks like CSS and is not CSS. Most "the layout is broken" bugs are one of these five rules.

1. **No cascade, no inheritance** — `StyleSheet.create({...})` produces props, not stylesheets. There are no descendant selectors and no class names; text styles do NOT inherit into nested views the way CSS expects. Compose with arrays: `style={[styles.base, isActive && styles.active]}`.
2. **`flexDirection` defaults to `column`** — the reverse of CSS's `row`. `flex: 1` fills remaining space; a child with no size and no `flex` can collapse to zero height. There is no `display: block/inline`; everything is flexbox.
3. **Values are numbers, not CSS strings** — `width: 16` is density-independent pixels. `"16px"` throws. Percentages work for `width`/`height`/offsets but not for `fontSize`, `borderWidth`, or shadows.
4. **Text must live in `<Text>`** — a bare string inside a `<View>` crashes with "Text strings must be rendered within a `<Text>` component". `<Text>` nested in `<Text>` is the only supported nesting.
5. **Shadows are two different APIs** — iOS uses `shadowColor`/`shadowOffset`/`shadowOpacity`/`shadowRadius`; Android uses `elevation`. Writing only the iOS props gives you an invisible shadow on Android and vice versa. Prefer `boxShadow` only if the RN version supports it — check before assuming.
6. **Safe areas, not hardcoded padding** — notches, Dynamic Island, and Android gesture bars change per device. Use `react-native-safe-area-context` (`SafeAreaView` / `useSafeAreaInsets`), and make sure the provider wraps your app. Hardcoded `paddingTop: 44` breaks on the next device.
7. **The keyboard covers your inputs unless you handle it** — wrap forms in `KeyboardAvoidingView` (iOS `behavior="padding"`, Android typically `height` or none) or use `react-native-keyboard-controller`. Also `Keyboard.dismiss()` on tap-outside. This is invisible on a simulator with a hardware keyboard.
8. **Don't nest a list in a `ScrollView`** — a `VirtualizedList`/`FlatList` inside a `ScrollView` loses windowing and warns "VirtualizedLists should never be nested". Give the list `flex: 1` in a bounded parent, or use `ListHeaderComponent`.
9. **Images need explicit dimensions** — `<Image>` with a remote URI and no width/height renders nothing. Set size, use `resizeMode`, and prefer `expo-image` for caching/placeholders.
10. **Platform and theme are runtime facts** — `Platform.select({ ios: ..., android: ... })` / `Platform.OS` for real differences; `useColorScheme()` for dark mode. Don't fork whole components for a color.

**Verify on both platforms and two device sizes** — `xcrun simctl io booted screenshot` / `adb exec-out screencap -p` (see `react-native-verification`). Styling that looks right on one platform commonly clips text on Android and hides shadows on iOS; a phone-sized layout often breaks on a tablet.

## Related skills

- `react-native-verification` — screenshot-based proof on each platform.
- `react-native-navigation` — headers, safe areas, and keyboard behavior with navigators.
- `frontend-design` / `accessibility` — design quality and screen-reader/touch-target requirements.
- `tailwind-css` — only if the app uses NativeWind; the CSS model above still applies underneath.
