// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyALhWMT3utILs2LnBGaadgRhtCTHWArUZ0",
  authDomain: "escucha-mi-ciudad-a13e0.firebaseapp.com",
  projectId: "escucha-mi-ciudad-a13e0",
  storageBucket: "escucha-mi-ciudad-a13e0.appspot.com", // <- corregido
  messagingSenderId: "724533238402",
  appId: "1:724533238402:web:779d71471d83305f26329b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);       // Para Firestore
export const storage = getStorage(app);    // Para Storage
