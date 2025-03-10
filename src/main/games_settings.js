export function addSessionCountToGames(games, sessions) {
  // calculate the number of sessions for each game
  let gameSessionCount = games.reduce((acc, game) => {
    acc[game.id] = { name: game.name, sessionCount: 0, duration: 0 };
    return acc;
  }, {});

  for (const session of sessions) {
    if (gameSessionCount[session.game.id]) {
      gameSessionCount[session.game.id].sessionCount += 1;
      gameSessionCount[session.game.id].duration += session.duration;
    }
  }

  let games_values = games.toSorted((a, b) => a.name.localeCompare(b.name));

  for (const gv of games_values) {
    gv.sessionCount = gameSessionCount[gv.id].sessionCount;
    gv.duration = gameSessionCount[gv.id].duration;
  }

  return games_values;
}

export function singleGameStats(game_id, sessions, teams) {
  let game_sessions = sessions.filter((s) => s.game.id === game_id);
  let total_sessions = game_sessions.length;
  let longuest_session = getLonguestSession(game_sessions);
  let smallest_session = getSmallestSession(game_sessions, longuest_session);
  let average_session = getAverageSession(game_sessions);
  let team_who_play_the_most = getTeamWhoPlayTheMost(game_sessions, teams);
  let total_playtime = getTotalPlaytime(game_sessions);
  return {
    gameId: game_id,
    _total_sessions: total_sessions,
    _longuest_session: longuest_session,
    _smallest_session: smallest_session,
    _average_session: average_session,
    _team_who_play_the_most: team_who_play_the_most,
    _total_playtime: total_playtime,
  };
}

function getLonguestSession(sessions) {
  if (sessions.length === 0) return 0;
  return sessions.reduce((acc, s) => (s.duration > acc ? s.duration : acc), 0);
}

function getSmallestSession(sessions, longuest_session) {
  if (sessions.length === 0) return 0;
  return sessions.reduce(
    (acc, s) => (s.duration < acc ? s.duration : acc),
    longuest_session,
  );
}

function getAverageSession(sessions) {
  if (sessions.length === 0) return 0;
  return (
    sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length
  ).toFixed(0);
}

function getTeamWhoPlayTheMost(sessions, teams) {
  const teamSessionCounts = sessions
    .map((s) => s.teams.map((team) => team))
    .flat()
    .reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

  // Check if no teams participated in any sessions
  if (Object.keys(teamSessionCounts).length === 0) return "";

  // Find the team ID with the maximum session count
  const teamIdMax = Object.keys(teamSessionCounts).reduce((a, b) =>
    teamSessionCounts[a] > teamSessionCounts[b] ? a : b,
  );

  const team = teams.find((t) => t.id === teamIdMax);
  return team ? team.name : "";
}

function getTotalPlaytime(sessions) {
  if (sessions.length === 0) return 0;
  return sessions.reduce((acc, s) => acc + s.duration, 0);
}
