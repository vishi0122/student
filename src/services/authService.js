// Authentication Service — Firebase Auth + Firestore profile
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Sign in with Firebase Auth, then load profile from Firestore
export const loginUser = async (email, password) => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Load role/profile from Firestore users collection (keyed by Firebase UID)
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) throw new Error('User profile not found. Contact admin.');

  const profile = snap.data();
  const { password: _, ...safeProfile } = profile;
  return safeProfile;
};

export const logoutUser = async () => {
  await signOut(auth);
};

// Returns the Firebase Auth user (has .uid, .email)
export const getCurrentFirebaseUser = () => auth.currentUser;

// Subscribe to auth state — used by AuthContext
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// Load Firestore profile for a given Firebase UID
export const loadUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const { password: _, ...safe } = snap.data();
  return safe;
};

export const isAuthenticated = () => auth.currentUser !== null;
