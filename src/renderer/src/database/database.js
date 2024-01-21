import db from "./firebaseConfig";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

//Teams
export async function getTeams() {
  const teamsList = [];
  const teamsSnapshot = await getDocs(collection(db, "teams"));
  teamsSnapshot.forEach((doc) => {
    teamsList.push(doc.data());
  });
  return teamsList;
}

export async function addTeam(name) {
  const teamsRef = collection(db, "teams");
  await setDoc(doc(teamsRef), {
    name: name,
  });
}

export const getSessions = async () => {
  const sessionsList = [];
  const sessionsSnapshot = await getDocs(collection(db, "sessions"));
  sessionsSnapshot.forEach((doc) => {
    sessionsList.push(doc.data());
  });
  return sessionsList;
};
