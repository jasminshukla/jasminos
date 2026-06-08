// -----------------------------------------------------------------------------
// Firebase + Google Sign-In configuration
// -----------------------------------------------------------------------------
// These values are NOT secrets (the Firebase web API key and OAuth client IDs are
// safe to ship in a client app — access is controlled by Firestore Security Rules
// and OAuth client restrictions). Fill them in from the Firebase / Google Cloud
// consoles. See FIREBASE_SETUP.md for exactly where each value comes from.
//
// Until you replace the placeholders below, sign-in will fail with a clear error.
// -----------------------------------------------------------------------------

// Firebase console → Project settings → General → "Your apps" → Web app → SDK setup
// (Register a Web app — the </> icon — to get apiKey/authDomain/projectId in one go.)
//   messagingSenderId + appId below are from your iOS app registration.
//   authDomain / storageBucket are usually <projectId>.firebaseapp.com / .appspot.com.
export const firebaseConfig = {
  apiKey: 'AIzaSyCtlkfgziXNzbzeLgN68cr3TgQ5dDUVpok',
  authDomain: 'tutorial-1534047433192.firebaseapp.com',
  projectId: 'tutorial-1534047433192',
  storageBucket: 'tutorial-1534047433192.firebasestorage.app',
  messagingSenderId: '590283937275',
  appId: '1:590283937275:ios:1a87bf1de7af3b909e675e',
};

// Google Cloud console → APIs & Services → Credentials → OAuth 2.0 Client IDs.
// - web:     the "Web client" client ID (Firebase Auth uses it to verify id tokens)
// - ios:     the iOS OAuth client ID (created for bundle id com.uplixdigital.exporeactnative)
// - android: the Android OAuth client ID (created for the package + SHA-1 fingerprint)
export const googleClientIds = {
  web: '590283937275-7mok3pkk7itlb0mv8shrrpvo5fp80b8s.apps.googleusercontent.com',
  ios: 'REPLACE_WITH_IOS_CLIENT_ID.apps.googleusercontent.com',
  android: 'REPLACE_WITH_ANDROID_CLIENT_ID.apps.googleusercontent.com',
};

// True once the placeholders have been replaced — used to show a helpful message
// instead of a cryptic network error during development.
export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('REPLACE_WITH');
export const isGoogleConfigured = !googleClientIds.web.startsWith('REPLACE_WITH');
