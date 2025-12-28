import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

export function getFirebase() {
  if (typeof window === "undefined") return { app: null, db: null, auth: null, storage: null }; // SSR safety

  if (!app) {
    try {
      // Check if config is valid
      if (!firebaseConfig.apiKey) {
        console.warn("Firebase API Key is missing. Firebase features will be disabled.");
        return { app: null, db: null, auth: null, storage: null };
      }
      app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
      // Don't throw, just return nulls to allow app to run in mock mode
      return { app: null, db: null, auth: null, storage: null };
    }
  }
  return { app, db, auth, storage };
}
