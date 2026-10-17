// Firebase configuration & live Cloud Firestore / Auth initialization
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyCUe_XSf4gcOHZfTsLzjFHAo1hfJMs9444",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "messmaster-c8b62.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "messmaster-c8b62",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "messmaster-c8b62.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "937370272941",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:937370272941:web:e1b284f69e12a2fbe87224"
};

export const isFirebaseConfigured = true;

let app = null;
let db = null;
let auth = null;
let googleProvider = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  console.info("⚡ Live Firebase connected to Project:", firebaseConfig.projectId);
} catch (err) {
  console.warn("⚠️ Firebase live connection initialization notice:", err);
}

export { app, db, auth, googleProvider, firebaseConfig };
