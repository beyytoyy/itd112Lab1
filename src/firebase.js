import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";  // Import collection and getDocs
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCloVqWmozlm6SzsU4L9QlbjWgziPOMOD0",
  authDomain: "itd112lab1mangoda.firebaseapp.com",
  projectId: "itd112lab1mangoda",
  storageBucket: "itd112lab1mangoda.appspot.com",
  messagingSenderId: "644177260301",
  appId: "1:644177260301:web:367e15fede1dcbf0960a44",
  measurementId: "G-JQWNNFHP9G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Export collection and getDocs
export { db, collection, getDocs };
