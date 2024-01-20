import { db } from "../main.js";
import { getDocs, collection, doc } from "firebase/firestore/lite";

export const getTeams = async () => {
  const t = collection(db, "teams");
  const teamSnapshot = await getDocs(t);
  const teamsList = teamSnapshot.docs.map((doc) => doc.data());
  return teamsList;
};

export const getSessions = async () => {
  const s = collection(db, "sessions");
  const sessionsSnapshot = await getDocs(s);
  const sessionsList = sessionsSnapshot.docs.map((doc) => doc.data());
  return sessionsList;
};
