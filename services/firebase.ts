// firebase config placeholder
// services/firebase.ts
import Constants from 'expo-constants';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Replace these placeholders with your Firebase config values
const firebaseConfig = {
  apiKey: "AIzaSyAruAYdVDGOCgcVm7xB34pCekEqwwRvKOE",
  authDomain: "lendmelibrary.firebaseapp.com",
  projectId: "lendmelibrary",
  storageBucket: "lendmelibrary.firebasestorage.app",
  messagingSenderId: "574100371053",
  appId: "1:574100371053:android:271d88c41595036360f164"
};

// optionally override via app.json -> expo.extra
const extra = Constants.manifest?.extra ?? (Constants.expoConfig?.extra ?? {});
if (extra.firebaseConfig) {
  Object.assign(firebaseConfig, extra.firebaseConfig);
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

console.log('🔥 Initializing Firebase with config:', {
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  
  db = getFirestore(app);
  console.log('✅ Firestore initialized');
  
} catch (error: any) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('Error details:', {
    message: error.message,
    code: error.code,
    stack: error.stack
  });
  
  // Don't set to undefined, let them remain undefined naturally
}

// Verify initialization
if (!app || !auth || !db) {
  console.error('❌ Firebase services not properly initialized:', {
    app: !!app,
    auth: !!auth,
    db: !!db
  });
} else {
  console.log('✅ All Firebase services initialized successfully');
}

export { app, auth, db };
