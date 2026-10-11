# QuickServe Customer App

React Native (Expo) app for customers to browse providers, book open slots, and manage their bookings. Uses the QuickServe API.

## Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iPhone). If the phone can't connect, use `npx expo start --tunnel`. Press `a` for an Android emulator or `w` for a browser preview.

The app calls the deployed API by default. Set `EXPO_PUBLIC_API_URL` to use another backend. The first request after the API has been idle can take up to a minute.

Demo login: `jordan.lee@quickserve.demo` / `Passw0rd!123`

## Structure

- `src/app` screens, one file each (Expo Router)
- `src/api.ts` every API call
- `src/authSlice.ts`, `src/store.ts` Redux auth state, saved with expo-secure-store
- `src/theme.ts`, `src/ui.tsx` colors, fonts, shared components
