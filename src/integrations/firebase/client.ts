import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration is intentionally public. Access is protected by
// Firebase Authentication and the Firestore rules in the repository.
const firebaseConfig = {
  apiKey: "AIzaSyD9x0he5yg0M12Z4MF8R0siypPpboo05xs",
  authDomain: "financial-monitor-d2d9c.firebaseapp.com",
  projectId: "financial-monitor-d2d9c",
  storageBucket: "financial-monitor-d2d9c.firebasestorage.app",
  messagingSenderId: "1034488919259",
  appId: "1:1034488919259:web:5a990bef8a5618c81fc8fe",
  measurementId: "G-8W98K9Y5J2",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Analytics relies on browser APIs, so keep it out of the server-rendering path.
if (typeof window !== "undefined") {
  void import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) getAnalytics(firebaseApp);
    })
    .catch(() => undefined);
}
