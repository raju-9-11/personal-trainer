import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

export function getFirebase() {
  if (typeof window === "undefined") return { app: null, db: null, auth: null }; // SSR safety

  if (!app) {
    try {
      // Check if config is valid
      if (!firebaseConfig.apiKey) {
        // Return nulls gracefully instead of throwing, allowing the app to fallback to Mock Mode
        console.warn("Firebase API Key is missing. Check .env.local. Falling back to Mock Mode.");
        return { app: null, db: null, auth: null };
      }
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
      auth = getAuth(app);
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
      // Fallback gracefully
      return { app: null, db: null, auth: null };
    }
  }
  return { app, db, auth };
}
