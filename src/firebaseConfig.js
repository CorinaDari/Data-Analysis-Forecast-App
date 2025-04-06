import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVF_tGgGzUZnjPKut3rZTV-SR87KS-7Tk",
  authDomain: "aplicatiesad.firebaseapp.com",
  projectId: "aplicatiesad",
  storageBucket: "aplicatiesad.firebasestorage.app",
  messagingSenderId: "134520291750",
  appId: "1:134520291750:web:d4041d44ef9ebcfa8b0f67",
  measurementId: "G-PG2PXMVHML"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { db, auth };
