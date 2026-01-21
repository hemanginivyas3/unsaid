import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsg4cAU6XHMqjbfYdGukMctLgjykUly7A",
  authDomain: "unsaid-99bf7.firebaseapp.com",
  projectId: "unsaid-99bf7",
  storageBucket: "unsaid-99bf7.firebasestorage.app",
  messagingSenderId: "796341475055",
  appId: "1:796341475055:web:589bbda572d587d00f2d1a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
