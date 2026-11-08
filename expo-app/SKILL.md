---
name: expo-app
description: Develop, run, and debug Expo and React Native mobile apps — Expo Router, file-based routing, native components, styling, navigation, and web/native simulation.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# Expo (React Native) App

Expo specifics (Universal React Native, iOS, Android, Web).

0. **Greenfield Scaffolding**:
   `npx --yes create-expo-app@latest . --template blank-typescript --no-install && npm install`
   Or for Expo Router template:
   `npx --yes create-expo-app@latest . --template tabs@52 --no-install && npm install`

1. **Expo Router (File-Based Routing)**:
   - `app/_layout.tsx` defines root Stack/Tabs navigation.
   - `app/index.tsx` is the home screen (`/`).
   - `app/(tabs)/_layout.tsx` defines tab bars with icons.
   - Navigation: `import { Link, useRouter } from 'expo-router'; router.push('/details')`.

2. **Core Components & Layout**:
   - Use `View`, `Text`, `TouchableOpacity`, `Pressable`, `TextInput`, `FlatList` from `react-native`.
   - Never use HTML tags (`div`, `p`, `span`, `button`).
   - Use `SafeAreaView` from `react-native-safe-area-context` to avoid notches and home indicators.
   - Flexbox layout: `flexDirection: 'column'` is the default in React Native (unlike web's row).

3. **Styling**:
   - Use `StyleSheet.create({ ... })` or NativeWind (Tailwind for React Native).
   - Values are unitless numbers (points/dp): `margin: 16`, `fontSize: 18`. Never use strings like `"16px"`.

4. **Run & Verify**:
   - Start bundler: `npx expo start`
   - Run on web: `npx expo start --web`
   - Run on iOS Simulator: `npx expo run:ios`
   - Run on Android Emulator: `npx expo run:android`
   - Type check: `npx tsc --noEmit`.
