export function teamList(teams, sessions, games) {
  // calculate gametime and most played game for each team
  const teamData = teams.reduce((acc, team) => {
    acc[team.id] = {
      id: team.id,
      name: team.name,
      playtime: 0,
      gameDurations: {}, // To track duration per game
      logo: "",
      selected: false,
    };
    return acc;
  }, {});

  sessions.forEach((session) => {
    for (const t of session.teams) {
      const team = teamData[t];
      if (team === undefined) return;
      team.playtime += session.duration;

      //if the game entry doesn't exist, create it
      if (!team.gameDurations[session.game.id]) {
        team.gameDurations[session.game.id] = {
          duration: 0,
          logo: getGameById(session.game.id, games).logo,
        };
      }

      team.gameDurations[session.game.id].duration += session.duration;
    }
  });

  // // Determine the most played game for each team and calculate their successes
  Object.values(teamData).forEach((team) => {
    //most played game
    let maxDuration = 0;
    Object.keys(team.gameDurations).forEach((gameName) => {
      const gameData = team.gameDurations[gameName];
      if (gameData.duration > maxDuration) {
        maxDuration = gameData.duration;
        team.logo = gameData.logo;
        team.game_name = gameName;
      }
    });

    delete team.gameDurations;
  });
  const calculated_teams = Object.values(teamData);
  return calculated_teams;
}

function getGameById(gameId, games) {
  let game = games.find((g) => g.id === gameId);
  if (game === undefined) return { name: "", heroe: "", logo: "" };
  return { name: game.name, heroe: game.heroe, logo: game.logo };
}
