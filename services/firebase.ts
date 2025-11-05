// services/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAruAYdVDGOCgcVm7xB34pCekEqwwRvKOE",
  authDomain: "lendmelibrary.firebaseapp.com",
  projectId: "lendmelibrary-dcf64",
  storageBucket: "lendmelibrary.firebasestorage.appspot.com",
  messagingSenderId: "574100371053",
  appId: "1:574100371053:android:271d88c41595036360f164",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

