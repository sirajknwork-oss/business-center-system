import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1SPdjQ6HP2Ik7BnI6LZ35PxpVqWvhDC0",
  authDomain: "noor-al-huda-crm-af7ee.firebaseapp.com",
  projectId: "noor-al-huda-crm-af7ee",
  storageBucket: "noor-al-huda-crm-af7ee.firebasestorage.app",
  messagingSenderId: "390309110954",
  appId: "1:390309110954:web:b843e205d1b8a429c4dcd3",
  measurementId: "G-1NHMM7BKM2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
