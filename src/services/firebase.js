import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDNWvI0emtnUbMBz24cmA4ea0uGJoX4lYg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "students-1b03c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "students-1b03c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "students-1b03c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "776620371587",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:776620371587:web:42ba0d9029ada144b475b6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7C6VZKP2RJ",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
