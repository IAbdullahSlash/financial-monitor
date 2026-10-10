import { FirebaseError } from "firebase/app";

const messages: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match. Try again.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "That email and password don't match. Try again.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Pick a stronger password — at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
  "auth/network-request-failed": "Couldn't reach the server. Check your connection.",
  "permission-denied": "You don't have permission to do that. Try signing in again.",
  unavailable: "Couldn't reach the server. Check your connection.",
};

/** Turns Firebase errors like "Firebase: Error (auth/invalid-credential)." into readable copy. */
export function friendlyError(err: unknown, fallback: string): string {
  if (err instanceof FirebaseError) return messages[err.code] ?? fallback;
  return fallback;
}
