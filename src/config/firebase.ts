import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDnlLZGrsV0go4KUstFc81Mkm8UmNuAA68",
  authDomain: "sanadai-8b098.firebaseapp.com",
  projectId: "sanadai-8b098",
  storageBucket: "sanadai-8b098.firebasestorage.app",
  messagingSenderId: "1046062877210",
  appId: "1:1046062877210:web:c5b8795261a80bdd639fa3",
  measurementId: "G-M4DC0NZFDP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;