# Follow-up & R&D App (Expo / React Native)

A mobile app with three things you asked for:

1. **Login / Register** — local accounts, session is remembered between launches.
2. **Follow-ups + Reminders** — add a follow-up, pick a time, and get a **push (local) notification** when it's due.
3. **R&D Vault** — save Instagram reel links, LinkedIn posts, or any free text to research later. Open links or re-share them anytime.

## Run it

```bash
npm install        # already done if you scaffolded here
npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator on macOS), or scan the QR code with **Expo Go** on your phone.

> 🔔 **Reminders fire only on a real device** (or a build), not in a simulator. Notifications are also local — they're scheduled by the app on your phone, so they work with no backend and no internet.

## How each module works

### Auth (`src/context/AuthContext.js`)
- Accounts are stored in `AsyncStorage`. The logged-in session is restored on launch.
- _Demo note:_ passwords are stored in plain text locally. For production, move auth to a real backend and hash passwords.

### Follow-ups + Reminders (`src/screens/AddFollowUpScreen.js`, `src/lib/notifications.js`)
- Add a title, optional contact and notes.
- Pick a reminder time — quick presets (In 1 hour, Tomorrow 9am…) or a custom date/time picker.
- On save, a one-off **local notification** is scheduled via `expo-notifications`. Marking the item done (or deleting it) cancels the pending notification.

### R&D Vault (`src/screens/AddRnDScreen.js`, `RnDListScreen.js`)
- Save a **link or free text**. Tap **📋 Paste** to drop in whatever you copied from Instagram / LinkedIn / a browser.
- The type (Instagram / LinkedIn / Link / Note) is auto-detected from the URL; you can override it.
- Add an optional title + tags. Later you can **filter**, **open** the link, **re-share** it to any app, or delete it.

## Project structure

```
App.js                      # providers + notification permission
src/
  context/
    AuthContext.js          # login / register / session
    StoreContext.js         # follow-ups + R&D data, per user
  lib/
    storage.js              # AsyncStorage wrapper
    notifications.js        # schedule / cancel local reminders
    datetime.js             # date formatting + presets
    id.js
  components/                # Button, Input, EmptyState
  screens/                  # Login, Register, FollowUp*, RnD*, Profile
  navigation/               # RootNavigator (auth gate) + AppTabs
```

## Optional next step: share directly from Instagram/LinkedIn

Right now you paste a link into the R&D screen. To make this app appear in the
OS **share sheet** (so you can hit "Share → ThisApp" from inside Instagram or
LinkedIn), add [`expo-share-intent`](https://github.com/achorein/expo-share-intent):

```bash
npx expo install expo-share-intent
```

Then add its config plugin to `app.json` and read the shared payload with its
hook, navigating to the `AddRnD` screen with the text as `route.params.sharedText`
(the screen already accepts that param). This requires a **custom dev build**
(`npx expo prebuild` + `eas build`) — it does not work in Expo Go.
