import db from "./firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export async function getTeams() {
  const teamsList = [];
  const teamsSnapshot = await getDocs(collection(db, "teams"));
  teamsSnapshot.forEach((doc) => {
    teamsList.push(doc.data());
  });
  return teamsList;
}

export const getSessions = async () => {
  const sessionsList = [];
  const sessionsSnapshot = await getDocs(collection(db, "sessions"));
  sessionsSnapshot.forEach((doc) => {
    sessionsList.push(doc.data());
  });
  return sessionsList;
};
