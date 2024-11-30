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

export function gamesFunPercentage(ids_of_teams, games, sessions) {
  //games_names
  let games_names = [];
  games.map((g) =>
    games_names.push(g.name.length > 10 ? g.name.slice(0, 6) + "..." : g.name),
  );

  let fun_percentage = [];
  let neutral_percentage = [];
  let bad_percentage = [];

  for (let g of games) {
    let fun = 0;
    let neutral = 0;
    let bad = 0;
    let cpt = 0;
    for (let s of sessions) {
      if (ids_of_teams.length === 0) {
        if (s.game.id === g.id) {
          cpt++;
          if (s.was_cool) {
            fun++;
          } else if (s.was_cool === undefined) {
            neutral++;
          } else {
            bad++;
          }
        }
      } else {
        if (s.game.id === g.id && ids_of_teams.includes(s.team.id)) {
          cpt++;
          if (s.was_cool) {
            fun++;
          } else if (s.was_cool === undefined) {
            neutral++;
          } else {
            bad++;
          }
        }
      }
    }
    fun_percentage.push(((fun / cpt) * 100).toFixed(2));
    neutral_percentage.push(((neutral / cpt) * 100).toFixed(2));
    bad_percentage.push(((bad / cpt) * 100).toFixed(2));
  }

  return {
    games_names,
    fun_percentage,
    neutral_percentage,
    bad_percentage,
  };
}

export function pieChartGamePercentage(ids_of_teams, games, sessions) {
  let temp_games = [];
  let total_playtime = 0;
  if (ids_of_teams.length > 0) {
    for (let g of games) {
      let acc = 0;
      for (let s of sessions) {
        if (ids_of_teams.includes(s.team.id) && s.game.id === g.id) {
          acc += s.duration;
          total_playtime += s.duration;
        }
      }
      temp_games.push({ name: g.name, playtime: acc });
    }
  } else {
    for (let g of games) {
      let acc = 0;
      for (let s of sessions) {
        if (s.game.id === g.id) {
          acc += s.duration;
          total_playtime += s.duration;
        }
      }
      temp_games.push({ name: g.name, playtime: acc });
    }
  }
  temp_games.sort((a, b) => b.playtime - a.playtime);
  temp_games = temp_games.filter((g) => g.playtime > 0);
  let games_name = temp_games.map((g) => g.name);
  let games_percentage = temp_games.map((g) =>
    ((g.playtime / total_playtime) * 100).toFixed(0),
  );
  let games_playtime = temp_games.map((g) => g.playtime);
  return { games_name, games_percentage, games_playtime };
}

export function doughnutChartPlatform(ids_of_teams, platforms, sessions) {
  let temp_games = [];
  let total_playtime = 0;
  if (ids_of_teams.length > 0) {
    for (let g of platforms) {
      let acc = 0;
      let number_of_sessions = 0;
      for (let s of sessions) {
        if (s.platform) {
          if (
            ids_of_teams.value.includes(s.team.id) &&
            s.platform.id === g.id
          ) {
            acc += s.duration;
            total_playtime += s.duration;
            number_of_sessions++;
          }
        }
      }
      temp_games.push({
        name: g.name,
        playtime: acc,
        number_of_sessions: number_of_sessions,
      });
    }
  } else {
    for (let g of platforms) {
      let acc = 0;
      let number_of_sessions = 0;
      for (let s of sessions) {
        if (s.platform) {
          if (s.platform.id === g.id) {
            acc += s.duration;
            total_playtime += s.duration;
            number_of_sessions++;
          }
        }
      }
      temp_games.push({
        name: g.name,
        playtime: acc,
        number_of_sessions: number_of_sessions,
      });
    }
  }
  temp_games.sort((a, b) => b.playtime - a.playtime);
  temp_games = temp_games.filter((g) => g.playtime > 0);
  let platforms_name = temp_games.map((g) => g.name);
  let platform_percentage = temp_games.map((g) =>
    ((g.playtime / total_playtime) * 100).toFixed(0),
  );
  let platform_playtime = temp_games.map((g) => g.playtime);
  let platform_number_of_sessions = temp_games.map((g) => g.number_of_sessions);

  return {
    platforms_name,
    platform_percentage,
    platform_playtime,
    platform_number_of_sessions,
  };
}

export function lineChartByMonth(ids_of_teams, sessions) {
  const months_names = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  //Set the sessions of the teams
  let sessions_of_the_team = [];
  for (let s of sessions) {
    if (ids_of_teams.includes(s.team.id)) {
      sessions_of_the_team.push(s);
    }
  }

  sessions_of_the_team.sort((a, b) => {
    return a.date.seconds - b.date.seconds;
  });

  let map_game_duration = new Map();
  let joyrate_map = new Map();
  let sessions_map = new Map();

  let cpt = 0;
  let date = new Date(sessions_of_the_team[0].date * 1000);
  let year = date.getFullYear();
  let month = date.getMonth();
  let last_year = year;
  let last_month = month;
  for (const s of sessions_of_the_team) {
    date = new Date(s.date * 1000);
    year = date.getFullYear();
    month = date.getMonth();
    if (year === last_year && month === last_month) {
      cpt++;
    } else {
      cpt = 1;
      last_year = year;
      last_month = month;
    }
    //add duration and joyrate to the month
    if (map_game_duration.has(year)) {
      if (map_game_duration.get(year).has(month)) {
        map_game_duration
          .get(year)
          .set(month, map_game_duration.get(year).get(month) + s.duration);
        let joyrate = joyrate_map.get(year).get(month) + (s.was_cool ? 1 : 0);
        joyrate_map.get(year).set(month, joyrate);
        sessions_map.get(year).set(month, cpt);
      } else {
        //create month
        map_game_duration.get(year).set(month, s.duration);
        joyrate_map.get(year).set(month, s.was_cool ? 1 : 0);
        sessions_map.get(year).set(month, cpt);
      }
    } else {
      //create year
      map_game_duration.set(year, new Map().set(month, s.duration));
      joyrate_map.set(year, new Map().set(month, s.was_cool ? 1 : 0));
      sessions_map.set(year, new Map().set(month, cpt));
    }
  }

  let labels_year_month = [];
  let game_duration_by_year_month = [];
  let joyrate_by_year_month = [];

  //sort the map
  map_game_duration = new Map(
    [...map_game_duration.entries()].sort((a, b) => a[0] - b[0]),
  );
  for (let [year, monthMap] of map_game_duration) {
    map_game_duration.set(
      year,
      new Map([...monthMap.entries()].sort((a, b) => a[0] - b[0])),
    );
  }

  for (let [year, monthMap] of map_game_duration) {
    for (let [month, duration] of monthMap) {
      labels_year_month.push(`${months_names[month]} ${year}`);
      game_duration_by_year_month.push(duration);
      joyrate_by_year_month.push(
        (joyrate_map.get(year).get(month) / sessions_map.get(year).get(month)) *
          100,
      );
    }
  }

  return {
    labels_year_month,
    game_duration_by_year_month,
    joyrate_by_year_month,
  };
}
