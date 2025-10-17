// firebase config placeholder
// services/firebase.ts
import Constants from 'expo-constants';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Replace these placeholders with your Firebase config values
const firebaseConfig = {
  apiKey: "<YOUR_API_KEY>",
  authDomain: "<YOUR_AUTH_DOMAIN>",
  projectId: "<YOUR_PROJECT_ID>",
  storageBucket: "<YOUR_STORAGE_BUCKET>",
  messagingSenderId: "<YOUR_SENDER_ID>",
  appId: "<YOUR_APP_ID>"
};

// optionally override via app.json -> expo.extra
const extra = Constants.manifest?.extra ?? (Constants.expoConfig?.extra ?? {});
if (extra.firebaseConfig) {
  Object.assign(firebaseConfig, extra.firebaseConfig);
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  // If initializeApp is called twice in dev hot-reload, this guards against crash.
  // In production this should not be triggered.
  // eslint-disable-next-line no-console
  console.warn('Firebase init warning:', e);
  // rethrow is not necessary; keep references possibly undefined
}

export { app, auth, db };
