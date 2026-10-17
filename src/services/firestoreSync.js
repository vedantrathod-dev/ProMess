// Firestore and Firebase Auth Live Synchronization Service
import { db, auth } from '../firebase/config.js';
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  limit
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from 'firebase/auth';

// Helper to push document to Firestore
export async function syncDocToFirestore(collectionName, docId, data) {
  if (!db) return;
  try {
    const cleanData = JSON.parse(JSON.stringify(data)); // strip any undefined
    await setDoc(doc(db, collectionName, String(docId)), cleanData, { merge: true });
    console.log(`[Firestore] Synced ${collectionName}/${docId}`);
  } catch (err) {
    console.warn(`[Firestore] Sync skipped for ${collectionName}/${docId}:`, err.message);
  }
}

// Bulk sync initial seed data if Firestore collection is empty
export async function seedFirestoreIfEmpty(collectionName, items) {
  if (!db || !items || !items.length) return;
  try {
    const collRef = collection(db, collectionName);
    const snap = await getDocs(query(collRef, limit(1)));
    if (snap.empty) {
      console.log(`[Firestore] Seeding initial data for ${collectionName}...`);
      for (const item of items) {
        if (item.id) {
          await setDoc(doc(db, collectionName, String(item.id)), item, { merge: true });
        }
      }
      console.log(`[Firestore] Seeded ${items.length} records into ${collectionName}`);
    }
  } catch (err) {
    console.warn(`[Firestore] Seeding notice for ${collectionName}:`, err.message);
  }
}

// Pull collections from Firestore on startup
export async function loadFromFirestore(collectionName) {
  if (!db) return null;
  try {
    const collRef = collection(db, collectionName);
    const snap = await getDocs(collRef);
    if (!snap.empty) {
      const records = [];
      snap.forEach(d => records.push({ ...d.data(), id: d.id }));
      return records;
    }
  } catch (err) {
    console.warn(`[Firestore] Fetch notice for ${collectionName}:`, err.message);
  }
  return null;
}

// Firebase Auth sign-in helper
export async function authenticateWithFirebaseAuth(email, password) {
  if (!auth) return { success: false };
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (err) {
    // If user doesn't exist yet in Firebase Auth, attempt auto-registration for development
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: newCred.user };
      } catch (createErr) {
        return { success: false, error: createErr.message };
      }
    }
    return { success: false, error: err.message };
  }
}
