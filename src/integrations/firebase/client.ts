import { getApp, getApps, initializeApp } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function requiredEnv(name: string): string {
  const value = import.meta.env[name];
  if (!value) throw new Error(`Missing required Firebase environment variable: ${name}`);
  return value;
}

// These values are browser configuration, not server secrets. Authentication
// and Firestore rules enforce access control.
const firebaseConfig: FirebaseOptions = {
  apiKey: requiredEnv("VITE_FIREBASE_API_KEY"),
  authDomain: requiredEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: requiredEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: requiredEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredEnv("VITE_FIREBASE_APP_ID"),
  // Optional: only needed for Google Analytics.
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Analytics relies on browser APIs, so keep it out of the server-rendering path.
if (typeof window !== "undefined") {
  void import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      if (firebaseConfig.measurementId && (await isSupported())) getAnalytics(firebaseApp);
    })
    .catch(() => undefined);
}
