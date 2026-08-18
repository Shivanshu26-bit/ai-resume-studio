import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import fallbackJsonConfig from "../../firebase-applet-config.json";

// Read client-safe environment variables
const env = (typeof import.meta !== "undefined" && (import.meta as any).env) || {};

const envApiKey = env.VITE_FIREBASE_API_KEY;
const envAuthDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
const envProjectId = env.VITE_FIREBASE_PROJECT_ID;
const envStorageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = env.VITE_FIREBASE_APP_ID;
const envDatabaseId = env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;

// Environment variables take strict priority over fallback JSON
export const firebaseConfig = {
  apiKey: envApiKey || (fallbackJsonConfig as any).apiKey,
  authDomain: envAuthDomain || (fallbackJsonConfig as any).authDomain,
  projectId: envProjectId || (fallbackJsonConfig as any).projectId,
  storageBucket: envStorageBucket || (fallbackJsonConfig as any).storageBucket,
  messagingSenderId: envMessagingSenderId || (fallbackJsonConfig as any).messagingSenderId,
  appId: envAppId || (fallbackJsonConfig as any).appId,
  firestoreDatabaseId: envDatabaseId !== undefined && envDatabaseId !== ""
    ? envDatabaseId
    : (fallbackJsonConfig as any).firestoreDatabaseId,
};

// Safe configuration validation without exposing secrets
const missingKeys: string[] = [];
if (!firebaseConfig.apiKey) missingKeys.push("VITE_FIREBASE_API_KEY / apiKey");
if (!firebaseConfig.projectId) missingKeys.push("VITE_FIREBASE_PROJECT_ID / projectId");
if (!firebaseConfig.appId) missingKeys.push("VITE_FIREBASE_APP_ID / appId");

if (missingKeys.length > 0) {
  console.error(
    `[Firebase Initialization Warning] Missing required configuration keys: ${missingKeys.join(", ")}. Please check your environment variables.`
  );
}

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Cloud Firestore with explicit custom databaseId if configured
export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== "(default)" &&
  firebaseConfig.firestoreDatabaseId !== ""
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Firebase Storage
export const storage = getStorage(app);

export default { app, auth, db, storage, googleProvider, firebaseConfig };

