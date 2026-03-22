import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNWvI0emtnUbMBz24cmA4ea0uGJoX4lYg",
  authDomain: "students-1b03c.firebaseapp.com",
  projectId: "students-1b03c",
  storageBucket: "students-1b03c.firebasestorage.app",
  messagingSenderId: "776620371587",
  appId: "1:776620371587:web:42ba0d9029ada144b475b6",
  measurementId: "G-7C6VZKP2RJ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
