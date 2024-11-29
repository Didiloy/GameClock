export function playtimeHome(values) {
  let teams_to_return = [];
  for (const team of values.teams) {
    teams_to_return.push({
      name: team.name,
      playtime: values.sessions.reduce((acc, s) => {
        if (s.team.id === team.id) {
          return acc + s.duration;
        }
        return acc;
      }, 0),
    });
  }
  return teams_to_return.sort((a, b) => {
    return b.playtime - a.playtime;
  });
}

export function barChartAllGames(ids_of_teams, team_name, games, sessions) {
  //games_names
  let games_names = [];
  games.map((g) =>
    games_names.push(g.name.length > 10 ? g.name.slice(0, 6) + "..." : g.name),
  );

  //sessions_number and average duration
  let sessions_number = [];
  let averages_duration = [];
  for (let g of games) {
    let acc = 0;
    let ss_num = 0;
    let duration_acc = 0;
    for (let s of sessions) {
      if (team_name) {
        if (s.game.id === g.id && ids_of_teams.includes(s.team.id)) {
          acc += 1;
          duration_acc += s.duration;
          ss_num++;
        }
      } else {
        if (s.game.id === g.id) {
          acc += 1;
          duration_acc += s.duration;
          ss_num++;
        }
      }
    }
    sessions_number.push(acc);
    averages_duration.push(duration_acc / ss_num);
  }

  return {
    games_names,
    sessions_number,
    averages_duration,
  };
}
