# Firebase (Google login) + Share-to-R&D setup

This app now uses **Firebase Authentication (Google sign-in)** and stores all
follow-ups and R&D items in **Cloud Firestore**, and it can receive an Instagram
reel (or any link) **shared into the app** straight onto the "Save to R&D" screen.

> ⚠️ Both features add native code, so they **do not work in Expo Go**. You must
> run a **development build** (see step 6).

All the code is wired up. You only need to (a) create a Firebase project, (b) paste
6 + 3 config values into `src/config/firebaseConfig.js`, and (c) build a dev client.

---

## 1. Create a Firebase project
1. Go to <https://console.firebase.google.com> → **Add project**.
2. Inside the project, open **Build → Authentication → Get started** and enable the
   **Google** sign-in provider. Save.

## 2. Get the Firebase web config
1. **Project settings (gear icon) → General → Your apps → Web app** (`</>`). Register
   an app if you haven't (any nickname).
2. Copy the `firebaseConfig` object values into the `firebaseConfig` block in
   `src/config/firebaseConfig.js` (`apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId`).

## 3. Create the Firestore database
1. **Build → Firestore Database → Create database** (Production mode is fine).
2. Deploy the security rules in this repo (`firestore.rules`) so each user can only
   touch their own data. Either paste them into the **Rules** tab in the console, or
   with the Firebase CLI:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase init firestore   # point it at firestore.rules when asked
   firebase deploy --only firestore:rules
   ```

## 4. Create Google OAuth client IDs
Sign-in uses `expo-auth-session`, which needs three OAuth client IDs from
**Google Cloud Console → APIs & Services → Credentials** (same project as Firebase).

| Client ID | How to create it | Paste into |
|-----------|------------------|------------|
| **Web** | Already created by Firebase when you enabled Google sign-in. Find it under "OAuth 2.0 Client IDs → Web client (auto created by Google Service)". | `googleClientIds.web` |
| **iOS** | Create credentials → OAuth client ID → **iOS**, Bundle ID = `com.uplixdigital.exporeactnative`. | `googleClientIds.ios` |
| **Android** | Create credentials → OAuth client ID → **Android**, Package = `com.uplixdigital.exporeactnative`, plus the **SHA-1** of your signing key (see below). | `googleClientIds.android` |

Get the Android SHA-1:
- **EAS managed credentials:** `eas credentials` → Android → view the SHA-1, or it's
  shown after the first `eas build`.
- **Local debug keystore:**
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
> If you change the app's bundle id / package in `app.json`, update the OAuth
> clients and the table above to match.

## 5. Paste everything into `src/config/firebaseConfig.js`
Replace every `REPLACE_WITH_...` placeholder. These values are **not secrets** — the
Firebase web key and OAuth client IDs are safe to ship in a client app; access is
controlled by the Firestore rules and OAuth client restrictions.

## 6. Build & run a development build (NOT Expo Go)
```bash
# generate native projects from app.json (optional; run/eas do this for you)
npx expo prebuild --clean

# Android — needs Android Studio/SDK locally:
npx expo run:android
# iOS — needs a Mac + Xcode:
npx expo run:ios

# …or build in the cloud with EAS (works from Windows for Android):
npm i -g eas-cli
eas build --profile development --platform android
```
Install the resulting dev build on a device/emulator, then `npx expo start --dev-client`.

---

## How sharing a reel works
1. In Instagram, open a reel → **Share → (your app)**.
   - Instagram shares the **reel URL** (not the video file). Private reels usually
     can't be shared out.
2. The app catches the link (`src/navigation/ShareIntentRouter.js`), and if you're
   signed in, opens **R&D → Save to R&D** with the link pre-filled and the type
   auto-detected as Instagram. Tap **Save to R&D** to store it in Firestore.
3. If you're not signed in yet, the link is held until you sign in, then routed.

Configured share targets (`app.json` → `expo-share-intent` plugin):
- **iOS:** web URLs, web pages, and plain text.
- **Android:** `text/*` (which is how Instagram shares the reel link).

## Data model (Firestore)
```
users/{uid}/followups/{autoId}   { title, note, contact, remindAt, notificationId, done, createdAt }
users/{uid}/rnd/{autoId}         { type, title, content, tags[], createdAt }
```
Lists update in real time via `onSnapshot`, so changes sync across devices/sessions
for the same Google account.

## Notes
- Sign-in session persists across restarts (Firebase Auth + AsyncStorage).
- Local reminder notifications are unchanged and still scheduled on-device.
- All Firebase imports use the **scoped** packages (`@firebase/app`,
  `@firebase/auth`, `@firebase/firestore`) — see the comment in `src/lib/firebase.js`
  for why. Don't switch them to `firebase/*` umbrella imports.
