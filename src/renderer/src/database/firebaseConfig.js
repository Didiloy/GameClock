import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "gameclock-ba16c.firebaseapp.com",
  databaseURL:
    "https://gameclock-ba16c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gameclock-ba16c",
  storageBucket: "gameclock-ba16c.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

//Initialize firebase
const firebaseapp = initializeApp(firebaseConfig);
export default getFirestore(firebaseapp);
