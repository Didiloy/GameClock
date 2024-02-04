import db from "./firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  getDoc,
  query,
  where,
  sum,
  getAggregateFromServer,
  and,
} from "firebase/firestore";
import { getGameId, getGameLogo, getGameHeroe } from "../api/steamgriddb";

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
    if (doc.data().name == name) {
      alreadyExists = true;
    }
  });
  if (alreadyExists) return false;
  await setDoc(doc(teamsRef), {
    name: name,
  });
  return true;
}

export async function getFirstTeamsByPlaytime(numberTeams) {
  let teams_to_return = [];
  let cpt = 0;
  const teamsSnapshot = await getDocs(collection(db, "teams"));
  for (let g of teamsSnapshot.docs) {
    cpt++;
    let p = await getTeamTotalPlaytime(g.ref);
    teams_to_return.push({
      name: g.data().name,
      playtime: p,
    });
  }
  return teams_to_return
    .sort((a, b) => {
      return b.playtime - a.playtime;
    })
    .slice(0, numberTeams == 0 ? cpt : numberTeams);
}

async function getTeamTotalPlaytime(teamRef) {
  let acc = 0;
  const q = query(collection(db, "sessions"), where("team", "==", teamRef));
  const sessions_on_team = await getDocs(q);
  for (const session of sessions_on_team.docs) {
    acc += session.data().duration;
  }
  return acc;
}

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

export async function addSession(teamName, gameName, duration, was_cool) {
  try {
    let gameAlreadyExists = false;
    let teamId;
    let gamePath = "";
    const gamesSnapshot = await getDocs(collection(db, "games"));
    for (let s of gamesSnapshot.docs) {
      if (s.data().name == gameName) {
        gameAlreadyExists = true;
        gamePath = s.id;
      }
    }

    const teamsSnapshot = await getDocs(collection(db, "teams"));
    for (let doc of teamsSnapshot.docs) {
      if (doc.data().name == teamName) {
        teamId = doc.id;
      }
    }
    if (!gameAlreadyExists) {
      const gamesRef = collection(db, "games");
      await setDoc(doc(gamesRef), {
        name: gameName,
      });
      await addImagesToGame(gameName);
      const gamesSnapshot = await getDocs(collection(db, "games"));
      for (let s of gamesSnapshot.docs) {
        if (s.data().name == gameName) {
          gamePath = s.id;
        }
      }
    }
    const sessionRef = collection(db, "sessions");
    await setDoc(doc(sessionRef), {
      duration: duration,
      was_cool: was_cool,
      date: new Date(),
      game: doc(collection(db, "games"), gamePath),
      team: doc(collection(db, "teams"), teamId),
    });
    return true;
  } catch (err) {
    return false;
  }
}

export async function getSumSessionsDurationAndMostPlayedLogo(teamName) {
  const q_team = query(collection(db, "teams"), where("name", "==", teamName));
  const teamRef = (await getDocs(q_team)).docs[0].ref;
  const q_sessions = query(
    collection(db, "sessions"),
    where("team", "==", teamRef)
  );
  const sessions_on_team = await getDocs(q_sessions);
  let total_duration = 0;
  let logo = await getMostPlayedLogo(sessions_on_team);
  for (let s in sessions_on_team.docs) {
    total_duration += sessions_on_team.docs[s].data().duration;
  }
  return {
    logo: logo,
    duration: total_duration,
  };
}

export async function getSumSessionsDuration(teamName) {
  const q_team = query(collection(db, "teams"), where("name", "==", teamName));
  const teamRef = (await getDocs(q_team)).docs[0].ref;
  const q_sessions = query(
    collection(db, "sessions"),
    where("team", "==", teamRef)
  );
  const sessions_on_team = await getDocs(q_sessions);
  let total_duration = 0;
  for (let s in sessions_on_team.docs) {
    total_duration += sessions_on_team.docs[s].data().duration;
  }
  return total_duration;
}

async function getMostPlayedLogo(sessions) {
  let games = [];
  for (let s in sessions.docs) {
    if (games.some((g) => g.id == sessions.docs[s].data().game.id)) {
      for (let g in games) {
        if (games[g].id == sessions.docs[s].data().game.id) {
          games[g].duration += sessions.docs[s].data().duration;
        }
      }
    } else {
      let tmpobj = {
        id: sessions.docs[s].data().game.id,
        duration: sessions.docs[s].data().duration,
      };
      games.push(tmpobj);
    }
  }
  games.sort((a, b) => b.duration - a.duration);
  const docRef = doc(db, "games", games[0].id);
  const docSnap = await getDoc(docRef);
  return docSnap.data().logo;
}

//Games
export async function getGames() {
  const gamesList = [];
  const gamesSnapshot = await getDocs(collection(db, "games"));
  gamesSnapshot.forEach((doc) => {
    let doc_id = doc.id;
    gamesList.push({ ...doc.data(), id: doc_id });
  });
  return gamesList;
}

export async function modifyGame(name, logo, heroe) {
  try {
    const q = query(collection(db, "games"), where("name", "==", name));
    const gameDocument = (await getDocs(q)).docs[0];
    await setDoc(doc(db, "games", gameDocument.id), {
      name: name,
      logo: logo,
      heroe: heroe,
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
  const gameid = await getGameId(gameName);
  const gameLogo = await getGameLogo(gameid);
  const gameHeroe = await getGameHeroe(gameid);

  // Add the logo in database
  await setDoc(doc(db, "games", gameId), {
    name: game.name,
    logo: gameLogo,
    heroe: gameHeroe,
  });
}

export async function getFirstGamesByPlaytime(numberOfGames, teamName) {
  if (teamName == "" || teamName == undefined) {
    return await getFirstGamesByPlaytimeWithoutTeam(numberOfGames);
  } else {
    const q_team = query(
      collection(db, "teams"),
      where("name", "==", teamName)
    );
    const teamRef = (await getDocs(q_team)).docs[0].ref;
    let games_to_return = [];
    let cpt = 0;
    const gamesSnapshot = await getDocs(collection(db, "games"));
    for (let g of gamesSnapshot.docs) {
      cpt++;
      let p = await getTeamGameTotalPlaytime(g.ref, teamRef);
      let j = await getGameJoyRate(g.ref, teamRef);
      games_to_return.push({
        name: g.data().name,
        playtime: p,
        heroe: g.data().heroe,
        joyRate: j,
        icon: g.data().logo,
      });
    }
    return games_to_return
      .sort((a, b) => {
        return b.playtime - a.playtime;
      })
      .slice(0, numberOfGames == 0 ? cpt : numberOfGames);
  }
}

async function getTeamGameTotalPlaytime(gameRef, teamRef) {
  let acc = 0;
  const q = query(
    collection(db, "sessions"),
    where("game", "==", gameRef),
    where("team", "==", teamRef)
  );
  const sessions_on_game = await getDocs(q);
  for (const session of sessions_on_game.docs) {
    acc += session.data().duration;
  }
  return acc;
}

export async function getFirstGamesByPlaytimeWithoutTeam(numberOfGames) {
  let games_to_return = [];
  let cpt = 0;
  const gamesSnapshot = await getDocs(collection(db, "games"));
  for (let g of gamesSnapshot.docs) {
    cpt++;
    let p = await getGameTotalPlaytime(g.ref);
    let j = await getGameJoyRate(g.ref);
    games_to_return.push({
      name: g.data().name,
      playtime: p,
      heroe: g.data().heroe,
      joyRate: j,
      icon: g.data().logo,
    });
  }
  return games_to_return
    .sort((a, b) => {
      return b.playtime - a.playtime;
    })
    .slice(0, numberOfGames == 0 ? cpt : numberOfGames);
}

async function getGameTotalPlaytime(gameRef) {
  let acc = 0;
  const q = query(collection(db, "sessions"), where("game", "==", gameRef));
  const sessions_on_game = await getDocs(q);
  for (const session of sessions_on_game.docs) {
    acc += session.data().duration;
  }
  return acc;
}

export async function getNumberOfGamePlayed(teamName) {
  const q_team = query(collection(db, "teams"), where("name", "==", teamName));
  const teamRef = (await getDocs(q_team)).docs[0].ref;
  const q_sessions = query(
    collection(db, "sessions"),
    where("team", "==", teamRef)
  );
  const sessions_on_team = await getDocs(q_sessions);
  let numberOfGames = 0;
  let played_game = [];
  for (let s in sessions_on_team.docs) {
    if (!played_game.includes(sessions_on_team.docs[s].data().game.id)) {
      numberOfGames++;
      played_game.push(sessions_on_team.docs[s].data().game.id);
    }
  }
  return numberOfGames;
}

export async function getGameSessionsNumber(gameName, teamName) {
  const q_game = query(collection(db, "games"), where("name", "==", gameName));
  const gameRef = (await getDocs(q_game)).docs[0].ref;
  let q_sessions;
  if (teamName == "" || teamName == undefined) {
    q_sessions = query(
      collection(db, "sessions"),
      where("game", "==", gameRef)
    );
  } else {
    const q_team = query(
      collection(db, "teams"),
      where("name", "==", teamName)
    );
    const teamRef = (await getDocs(q_team)).docs[0].ref;
    q_sessions = query(
      collection(db, "sessions"),
      where("game", "==", gameRef),
      where("team", "==", teamRef)
    );
  }
  const sessions_on_game = await getDocs(q_sessions);
  let acc = sessions_on_game.docs.length;
  return acc;
}

export async function getGameAvgDuration(gameName, teamName) {
  const q_game = query(collection(db, "games"), where("name", "==", gameName));
  const gameRef = (await getDocs(q_game)).docs[0].ref;
  let q_sessions;
  if (teamName == "" || teamName == undefined) {
    q_sessions = query(
      collection(db, "sessions"),
      where("game", "==", gameRef)
    );
  } else {
    const q_team = query(
      collection(db, "teams"),
      where("name", "==", teamName)
    );
    const teamRef = (await getDocs(q_team)).docs[0].ref;
    q_sessions = query(
      collection(db, "sessions"),
      where("game", "==", gameRef),
      where("team", "==", teamRef)
    );
  }
  const sessions_on_game = await getDocs(q_sessions);
  let sessions_duration = [];
  for (const session of sessions_on_game.docs) {
    sessions_duration.push(session.data().duration);
  }
  const average = (array) =>
    array.length == 0 ? 0 : array.reduce((a, b) => a + b) / array.length;
  return average(sessions_duration).toFixed(2);
}

export async function getGameCoolPercentage(gameName, teamName) {
  const q_game = query(collection(db, "games"), where("name", "==", gameName));
  const gameRef = (await getDocs(q_game)).docs[0].ref;
  if (teamName == "" || teamName == undefined) {
    return await getGameJoyRate(gameRef);
  } else {
    const q_team = query(
      collection(db, "teams"),
      where("name", "==", teamName)
    );
    const teamRef = (await getDocs(q_team)).docs[0].ref;
    return await getGameJoyRate(gameRef, teamRef);
  }
}

async function getGameJoyRate(gameRef, teamRef) {
  let was_cool = 0;
  let cpt = 0;
  let q;
  if (teamRef == "" || teamRef == undefined) {
    q = query(collection(db, "sessions"), where("game", "==", gameRef));
  } else {
    q = query(
      collection(db, "sessions"),
      where("game", "==", gameRef),
      where("team", "==", teamRef)
    );
  }
  const sessions_on_game = await getDocs(q);
  for (const session of sessions_on_game.docs) {
    cpt++;
    if (session.data().was_cool) was_cool++;
  }
  let percentage;
  if (was_cool == 0) percentage = 0;
  else percentage = (was_cool / cpt) * 100;
  return percentage;
}

//Playtime
export async function getTotalPlaytime() {
  const coll = collection(db, "sessions");
  const snapshot = await getAggregateFromServer(coll, {
    total_playtime: sum("duration"),
  });
  return snapshot.data().total_playtime;
}

export async function calculateTeamRankingByDuration(teamName) {
  let teamsList = [];
  const teamsSnapshot = await getDocs(collection(db, "teams"));
  teamsSnapshot.forEach((doc) => {
    teamsList.push(doc);
  });
  let team_name_session_number = [];
  for (let team of teamsList) {
    let team_name = team.data().name;
    let team_playtime = await getSumSessionsDuration(team_name);
    team_name_session_number.push({
      team_name: team_name,
      team_playtime: team_playtime,
    });
  }
  team_name_session_number.sort((a, b) => {
    return b.team_playtime - a.team_playtime;
  });
  let index =
    team_name_session_number.findIndex((e) => e.team_name == teamName) + 1; //La première position est 1 et non 0
  return index;
}
