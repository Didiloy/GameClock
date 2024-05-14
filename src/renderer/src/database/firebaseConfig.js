import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

let firebaseConfig = {};

//Initialize firebase
let firebaseapp;
export let db;

export function initialiseFirebase(stored_databases, selected_database_index) {
  firebaseConfig = {
    apiKey: stored_databases.value[selected_database_index.value].apiKey,
    authDomain:
      stored_databases.value[selected_database_index.value].authDomain,
    databaseURL:
      stored_databases.value[selected_database_index.value].databaseURL,
    projectId: stored_databases.value[selected_database_index.value].projectId,
    storageBucket:
      stored_databases.value[selected_database_index.value].storageBucket,
    messagingSenderId:
      stored_databases.value[selected_database_index.value].messagingSenderId,
    appId: stored_databases.value[selected_database_index.value].appId,
  };
  firebaseapp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseapp);
}

//  databaseURL:
//"https://gameclock-ba16c-default-rtdb.europe-west1.firebasedatabase.app",
