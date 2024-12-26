export function addSessionCountToGames(games, sessions) {
  // calculate the number of sessions for each game
  let gameSessionCount = games.reduce((acc, game) => {
    acc[game.id] = { name: game.name, sessionCount: 0 };
    return acc;
  }, {});

  for (const session of sessions) {
    if (gameSessionCount[session.game.id]) {
      gameSessionCount[session.game.id].sessionCount += 1;
    }
  }

  let games_values = games.toSorted((a, b) => a.name.localeCompare(b.name));

  for (const gv of games_values) {
    gv.sessionCount = gameSessionCount[gv.id].sessionCount;
  }

  return games_values;
}
