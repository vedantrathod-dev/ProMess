// Firebase Authentication Service
// Handles Google OAuth Sign-In & Email/Password Sign-In / Registration
import { auth, googleProvider } from '../firebase/config.js';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth';
import { loginOrRegisterFirebaseUser, registerStudent, logout as storeLogout } from './store.js';

// Google Sign-In with popup
export async function signInWithGoogle(role = 'student') {
  if (!auth || !googleProvider) {
    return { success: false, message: 'Firebase Authentication is not available in this environment.' };
  }

  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const fbUser = credential.user;

    const res = loginOrRegisterFirebaseUser({
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      uid: fbUser.uid,
      role
    });

    return {
      success: true,
      user: res.user,
      isNew: res.isNew,
      message: res.isNew ? 'Google sign-up successful! Welcome to ProMess.' : 'Welcome back!'
    };
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'Google Sign-In was closed before completion.' };
    }
    if (err.code === 'auth/popup-blocked') {
      return { success: false, message: 'Pop-up window was blocked by your browser. Please allow popups for localhost.' };
    }
    if (err.code === 'auth/unauthorized-domain') {
      return {
        success: false,
        message: 'This domain is not authorized in Firebase Console (messmaster-c8b62). Add localhost to Authentication > Settings > Authorized domains.'
      };
    }
    return { success: false, message: err.message || 'Failed to authenticate with Google.' };
  }
}

// Email & Password Sign-In
export async function signInWithEmail(email, password, role = 'student') {
  if (!auth) {
    return { success: false, message: 'Firebase Authentication is not initialized.' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, message: 'Please enter both email and password.' };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = credential.user;

    const res = loginOrRegisterFirebaseUser({
      email: fbUser.email,
      displayName: fbUser.displayName,
      photoURL: fbUser.photoURL,
      uid: fbUser.uid,
      role
    });

    return {
      success: true,
      user: res.user,
      message: 'Signed in successfully with Firebase!'
    };
  } catch (err) {
    console.warn('Firebase Email Sign-In notice:', err.code, err.message);

    // Friendly error mappings & automatic user provisioning for seed accounts
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        // Attempt to auto-create account in Firebase Auth if it's the first time
        if (password.length >= 6) {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          const res = loginOrRegisterFirebaseUser({
            email: newCred.user.email,
            displayName: cleanEmail.split('@')[0],
            uid: newCred.user.uid,
            role
          });
          return {
            success: true,
            user: res.user,
            message: 'Firebase account registered and signed in!'
          };
        }
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          return { success: false, message: 'Incorrect password for this email in Firebase.' };
        }
      }
      return { success: false, message: 'Incorrect email or password, or account not yet registered.' };
    }
    if (err.code === 'auth/invalid-email') {
      return { success: false, message: 'Invalid email format.' };
    }
    return { success: false, message: err.message || 'Firebase email sign in failed.' };
  }
}

// Email & Password Registration
export async function signUpWithEmail({ email, password, full_name, mobile, college_name, dietary_type, meal_entitlement, duration_days }) {
  if (!auth) {
    return { success: false, message: 'Firebase Authentication is not initialized.' };
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { success: false, message: 'Please provide both email and password.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  try {
    // 1. Create user in Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const fbUser = credential.user;

    // 2. Register student in ProMess store & Cloud Firestore
    const storeRes = registerStudent({
      full_name: full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      mobile: mobile || '+91 98450 12345',
      college_name,
      dietary_type: dietary_type || 'veg',
      meal_entitlement: meal_entitlement || 'both',
      duration_days: duration_days || 30
    });

    if (!storeRes.success) {
      return { success: false, message: storeRes.message };
    }

    // Attach firebase uid to student
    storeRes.user.firebase_uid = fbUser.uid;

    return {
      success: true,
      user: storeRes.user,
      message: 'Account created and dining pass generated successfully!'
    };
  } catch (err) {
    console.error('Firebase Sign-Up Error:', err);
    if (err.code === 'auth/email-already-in-use') {
      return { success: false, message: 'This email is already registered in Firebase. Please sign in instead.' };
    }
    if (err.code === 'auth/weak-password') {
      return { success: false, message: 'Password is too weak. Please use at least 6 characters.' };
    }
    return { success: false, message: err.message || 'Firebase registration failed.' };
  }
}

// Sign Out
export async function signOutFirebase() {
  try {
    if (auth) {
      await fbSignOut(auth);
    }
  } catch (err) {
    console.warn('Firebase sign out notice:', err);
  }
  storeLogout();
}
