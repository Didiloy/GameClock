export function playtimeHome(values) {
  let teams_to_return = [];
  for (const team of values.teams) {
    teams_to_return.push({
      name: team.name,
      playtime: values.sessions.reduce((acc, s) => {
        if (s.teams.includes(team.id)) {
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
        if (
          s.game.id === g.id &&
          s.teams.some((team) => ids_of_teams.includes(team))
        ) {
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
        if (
          s.game.id === g.id &&
          s.teams.some((team) => ids_of_teams.includes(team))
        ) {
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
        if (
          s.teams.some((team) => ids_of_teams.includes(team)) &&
          s.game.id === g.id
        ) {
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
            s.teams.some((team) => ids_of_teams.includes(team)) &&
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
  let labels_year_month = [];
  let game_duration_by_year_month = [];
  let joyrate_by_year_month = [];

  const months_names = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  //Set the sessions of the teams
  let sessions_of_the_team = [];
  for (let s of sessions) {
    if (s.teams.some((team) => ids_of_teams.includes(team))) {
      sessions_of_the_team.push(s);
    }
  }

  if (sessions_of_the_team.length === 0 || sessions_of_the_team === undefined) {
    return {
      labels_year_month,
      game_duration_by_year_month,
      joyrate_by_year_month,
    };
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
      labels_year_month.push(`${months_names[month]}/${year}`);
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

export function lineChartPlayerOfTheWeek(sessions, teams) {
  // Get the array of dates
  const labels_dates = getLast7Days();

  // Map team IDs to team names
  const teamIdToNameMap = new Map(teams.map((team) => [team.id, team.name]));

  // Get the last 7 days
  const last7Days = getLast7Days();

  const map_player_time_played = new Map();

  for (const team of teams) {
    map_player_time_played.set(team.name, Array(7).fill(0));
  }

  for (const session of sessions) {
    for (const team of session.teams) {
      const sessionDate = formatTimestampToDDMMYYYY(session.date);
      const teamName = teamIdToNameMap.get(team);

      if (teamName && last7Days.includes(sessionDate)) {
        const dayIndex = last7Days.indexOf(sessionDate); // Get the day index
        const playtimeArray = map_player_time_played.get(teamName);
        playtimeArray[dayIndex] += session.duration;
      }
    }
  }

  return { labels_dates, map_player_time_played };
}

function formatDateToDDMMYYYY(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTimestampToDDMMYYYY(timestamp) {
  const date = new Date(timestamp * 1000);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const getLast7Days = () => {
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    last7Days.push(formatDateToDDMMYYYY(date));
  }

  return last7Days;
};

export function lineChartLastMonth(sessions, teams) {
  // Get the array of dates
  const labels_dates = getLastMonth();

  // Map team IDs to team names
  const teamIdToNameMap = new Map(teams.map((team) => [team.id, team.name]));

  // Get the last 7 days
  const lastMonth = getLastMonth();

  const map_player_time_played = new Map();

  for (const team of teams) {
    map_player_time_played.set(team.name, Array(31).fill(0));
  }

  for (const session of sessions) {
    for (const team of session.teams) {
      const sessionDate = formatTimestampToDDMMYYYY(session.date);
      const teamName = teamIdToNameMap.get(team);

      if (teamName && lastMonth.includes(sessionDate)) {
        const dayIndex = lastMonth.indexOf(sessionDate); // Get the day index
        const playtimeArray = map_player_time_played.get(teamName);
        playtimeArray[dayIndex] += session.duration;
      }
    }
  }

  return { labels_dates, map_player_time_played };
}

const getLastMonth = () => {
  const lastMonth = [];
  const today = new Date();

  for (let i = 31; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    lastMonth.push(formatDateToDDMMYYYY(date));
  }

  return lastMonth;
};
