import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALhWMT3utILs2LnBGaadgRhtCTHWArUZ0",
  authDomain: "escucha-mi-ciudad-a13e0.firebaseapp.com",
  projectId: "escucha-mi-ciudad-a13e0",
  storageBucket: "escucha-mi-ciudad-a13e0.firebasestorage.app",
  messagingSenderId: "724533238402",
  appId: "1:724533238402:web:779d71471d83305f26329b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);