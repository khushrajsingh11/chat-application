
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-1a945.firebaseapp.com",
  projectId: "reactchat-1a945",
  storageBucket: "reactchat-1a945.firebasestorage.app",
  messagingSenderId: "44013351932",
  appId: "1:44013351932:web:fb7a6772c401403baaf879"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()