import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// These are public client-side identifiers, NOT secrets.
// Security is enforced by Firestore Security Rules + Firebase Auth.
const firebaseConfig = {
  apiKey: "AIzaSyA2FQMg-e7DrfMymOZ8qxdfmVGFhC_uL4o",
  authDomain: "floranova-2cb63.firebaseapp.com",
  projectId: "floranova-2cb63",
  storageBucket: "floranova-2cb63.firebasestorage.app",
  messagingSenderId: "385792577819",
  appId: "1:385792577819:web:47e4456bc92e5d90cc43be",
  measurementId: "G-NMWMR8W185"
};

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const auth = getAuth(app);

export { db, auth };
