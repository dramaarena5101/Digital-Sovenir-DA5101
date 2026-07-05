import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

// Sign in with Google
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDoc(result.user);
  return result.user;
}

// Sign in with Email/Password
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Sign up with Email/Password
export async function signUpWithEmail(email, password, name) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  await ensureUserDoc(result.user, name);
  return result.user;
}

// Sign out
export async function signOut() {
  return firebaseSignOut(auth);
}

// Listen to auth state changes
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Ensure user document exists in Firestore
async function ensureUserDoc(user, displayName) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: displayName || user.displayName || '',
      email: user.email,
      photoURL: user.photoURL || '',
      activated: false,
      activationCode: null,
      activationDate: null,
      role: 'user',
      createdAt: serverTimestamp(),
    });
  }
}

// Check if user is activated
export async function checkActivation(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().activated === true;
  }
  return false;
}

// Check if user is admin
export async function checkAdmin(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data().role === 'admin';
  }
  return false;
}
