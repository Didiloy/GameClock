import { db } from "./firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  getGameId,
  getGameLogo,
  getGameHeroe,
  getGameGrid,
} from "../api/steamgriddb";

//Teams
export async function getTeams() {
  const teamsList = [];
  const teamsSnapshot = await getDocs(collection(db, "teams"));
  teamsSnapshot.forEach((doc) => {
    let doc_id = doc.id;
    teamsList.push({ ...doc.data(), id: doc_id });
  });
  return teamsList;
}

export async function addTeam(name) {
  let alreadyExists = false;
  const teamsRef = collection(db, "teams");
  const teamsSnapshot = await getDocs(teamsRef);
  teamsSnapshot.forEach((doc) => {
    if (doc.data().name === name) {
      alreadyExists = true;
    }
  });
  if (alreadyExists) return false;
  await setDoc(doc(teamsRef), {
    name: name,
  });
  return true;
}

export const getIdOfTeam = (teamName, teams) => {
  if (teamName === undefined || teams === undefined) return "";
  return teams.filter((t) => t.name === teamName)[0].id !== undefined
    ? teams.filter((t) => t.name === teamName)[0].id
    : "";
};

//Sessions
export const getSessions = async () => {
  const sessionsList = [];
  const sessionsSnapshot = await getDocs(collection(db, "sessions"));
  sessionsSnapshot.forEach((doc) => {
    let doc_id = doc.id;
    sessionsList.push({ ...doc.data(), id: doc_id });
  });
  return sessionsList;
};

import { useStore } from "../store/store";
function getIfGameExist(gameName) {
  const games = useStore().games;
  const exist = games.filter((g) => g.name === gameName).length > 0;
  if (exist) {
    return { exist: true, id: games.filter((g) => g.name === gameName)[0].id };
  }
  return { exist: false };
}

export async function addSession(teamId, gameName, duration, was_cool) {
  try {
    let { exist, id } = getIfGameExist(gameName);
    let gamePath = id ? id : "";
    let gameAlreadyExists = exist;

    if (!gameAlreadyExists) {
      const gamesRef = collection(db, "games");
      await setDoc(doc(gamesRef), {
        name: gameName,
      });

      await addImagesToGame(gameName);

      const gamesSnapshot = await getDocs(collection(db, "games"));
      for (let s of gamesSnapshot.docs) {
        if (s.data().name === gameName) {
          gamePath = s.id;
        }
      }
    }
    const sessionRef = collection(db, "sessions");
    //if the session was neutral we don't add was cool
    if (was_cool !== undefined) {
      await setDoc(doc(sessionRef), {
        duration: duration,
        was_cool: was_cool,
        date: new Date(),
        game: doc(collection(db, "games"), gamePath),
        team: doc(collection(db, "teams"), teamId),
      });
    } else {
      await setDoc(doc(sessionRef), {
        duration: duration,
        date: new Date(),
        game: doc(collection(db, "games"), gamePath),
        team: doc(collection(db, "teams"), teamId),
      });
    }
    return true;
  } catch (err) {
    console.log("err: ", err);
    return false;
  }
}

//Games
export async function getGames() {
  let gamesList = [];
  const gamesSnapshot = await getDocs(collection(db, "games"));
  gamesSnapshot.forEach((doc) => {
    let doc_id = doc.id;
    gamesList.push({ ...doc.data(), id: doc_id });
  });
  return gamesList;
}

export async function modifyGame(name, logo, heroe, grid) {
  try {
    const q = query(collection(db, "games"), where("name", "==", name));
    const gameDocument = (await getDocs(q)).docs[0];
    await setDoc(doc(db, "games", gameDocument.id), {
      name: name,
      logo: logo === undefined ? "" : logo,
      heroe: heroe === undefined ? "" : heroe,
      grid: grid === undefined ? "" : grid,
    });
    return true;
  } catch (error) {
    return false;
  }
}

export async function addImagesToGame(gameName) {
  //get the game in database
  let gameId = "";
  let game;
  const gamesSnapshot = await getDocs(collection(db, "games"));
  for (let s of gamesSnapshot.docs) {
    if (s.data().name == gameName) {
      gameId = s.id;
      game = s.data();
    }
  }

  //get the logo from steamgriddb
  let gameid = "";
  let gameLogo = "";
  let gameHeroe = "";
  let gameGrid = "";
  try {
    gameid = await getGameId(gameName);
  } catch (err) {
    console.log("error getting game id from steamgriddb", err);
    return;
  }

  try {
    gameLogo = await getGameLogo(gameid);
    gameHeroe = await getGameHeroe(gameid);
    gameGrid = await getGameGrid(gameid);
  } catch (err) {
    console.log("error getting game images from steamgriddb", err);
    return;
  }

  // Add the logo in database
  await setDoc(doc(db, "games", gameId), {
    name: game.name,
    logo: gameLogo,
    heroe: gameHeroe,
    grid: gameGrid,
  });
}
