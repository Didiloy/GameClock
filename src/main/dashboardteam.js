export function dashboardteam(ids_of_team, games, sessions, teams) {
  let [team_time, sessions_number] = calculateTeamTime(ids_of_team, sessions);
  let number_of_games = getNumberOfGames(ids_of_team, games, sessions);
  let total_fun_percentage = getTotalFunPercentage(sessions);

  let team_average_session_duration = calculateAverageSessionDuration(
    ids_of_team,
    sessions,
    sessions_number,
  );

  let [biggest_session, game_of_biggest_session] = calculateBiggestSession(
    ids_of_team,
    sessions,
    games,
  );

  let [max_day, max_duration] = getDayMostPlayed(ids_of_team, sessions);
  return {
    team_time,
    sessions_number,
    number_of_games,
    total_fun_percentage,
    team_average_session_duration,
    biggest_session,
    game_of_biggest_session,
    max_day,
    max_duration,
  };
}

function getDayMostPlayed(ids_of_team, sessions) {
  let duration_per_day = new Map(); //shower
  for (const session of sessions) {
    const sessionDate = new Date(session.date * 1000);
    const dayKey = sessionDate.toISOString().split("T")[0]; // Extract YYYY-MM-DD
    if (session.teams.some((team) => ids_of_team.includes(team))) {
      if (duration_per_day.has(dayKey)) {
        duration_per_day.set(
          dayKey,
          duration_per_day.get(dayKey) + session.duration,
        );
      } else {
        duration_per_day.set(dayKey, session.duration);
      }
    }
  }

  let max_duration = 0;
  let max_day = "";
  for (const [day, totalDuration] of duration_per_day) {
    if (totalDuration > max_duration) {
      max_duration = totalDuration;
      max_day = day;
    }
  }
  return [max_day, max_duration];
}

function calculateTeamTime(ids_of_team, sessions) {
  if (ids_of_team.length === 0) return [0, 0];
  let cpt = 0;
  let sessions_number = 0;
  sessions.forEach((element) => {
    cpt += element.duration;
    sessions_number++;
  });
  return [cpt, sessions_number];
}

function getNumberOfGames(ids_of_team, games, sessions) {
  if (ids_of_team.length === 0) return 0;
  let cpt = 0;
  let played_games = [];
  sessions.forEach((element) => {
    if (element.teams.some((team) => ids_of_team.includes(team))) {
      if (!played_games.includes(element.game.id)) {
        played_games.push(element.game.id);
        cpt++;
      }
    }
  });
  //for deleted games the game is not in the games list even if we have the id
  //so we need to check if the game is in the games list
  for (let g of played_games) {
    if (games.filter((game) => game.id === g).length === 0) {
      cpt--;
    }
  }
  return cpt;
}

function getTotalFunPercentage(sessions) {
  let fun = 0;
  let neutral = 0;
  let bad = 0;

  sessions.map((s) => {
    if (s.was_cool) fun++;
    else if (s.was_cool === undefined) neutral++;
    else bad++;
  });

  let happiness = (fun * 1 + neutral * 0.5 + bad * 0) / sessions.length;
  return (happiness * 100).toFixed(0);
}

function calculateAverageSessionDuration(
  ids_of_team,
  sessions,
  sessions_number,
) {
  if (ids_of_team.length === 0) return 0;
  let cpt = 0;
  sessions.forEach((element) => {
    if (element.teams.some((team) => ids_of_team.includes(team))) {
      cpt += element.duration;
    }
  });
  cpt = (cpt / sessions_number).toFixed(2);
  return cpt;
}

function calculateBiggestSession(ids_of_team, sessions, games) {
  if (ids_of_team.length === 0) return [0, ""];
  let cpt = 0;
  let game_id = "";
  sessions.forEach((element) => {
    if (element.teams.some((team) => ids_of_team.includes(team))) {
      if (cpt > element.duration) {
        return;
      }
      cpt = element.duration;
      game_id = element.game.id;
    }
  });
  return [cpt, getGameNameById(game_id, games)];
}

function getGameNameById(id, games) {
  if (id === "") {
    return;
  }
  return games.find((element) => element.id === id).name;
}
