// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjIylNJ8N-o9P-8kzSCyyBzw9k25bjwbo",
  authDomain: "howto-archive.firebaseapp.com",
  projectId: "howto-archive",
  storageBucket: "howto-archive.firebasestorage.app",
  messagingSenderId: "1044089213484",
  appId: "1:1044089213484:web:a9a08161c7eb84aa1af789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);