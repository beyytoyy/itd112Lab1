import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"; // Added getDocs import

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDka3Yzozax0cNjm30qNVvhKiQ9ktQlPgE",
  authDomain: "itd112lab3mangoda-7ae11.firebaseapp.com",
  projectId: "itd112lab3mangoda-7ae11",
  storageBucket: "itd112lab3mangoda-7ae11.firebasestorage.app",
  messagingSenderId: "204524746379",
  appId: "1:204524746379:web:7cb391f14c18b503cb068e",
  measurementId: "G-Z03HVV7N6X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore methods
export { db, collection, addDoc, getDocs }; // Added getDocs export