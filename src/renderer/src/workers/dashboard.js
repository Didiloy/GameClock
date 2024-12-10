self.onmessage = (event) => {
  const { sessions, games, teams } = event.data;
  // self.postMessage({ finished: true, label: "caca" });
  if (sessions.length === 0) {
    self.postMessage({ finished: true });
  } else {
    initDashboard(sessions, games, teams);
  }
};

function initDashboard(sessions, games, teams) {
  let sessions_number = 0;
  let team_with_most_sessions = "";
  let team_with_most_sessions_value = 0;
  let average_session_per_day = 0;
  let team_with_greatest_session_average_playtime = "";
  let team_with_greatest_session_average_playtime_value = 0;
  let number_of_games = 0;
  let game_of_the_week = "";
  let game_of_the_week_time = 0;
  let player_of_the_week = "";
  let second_player_of_the_week = "";
  let difference_between_player_of_the_week = 0;
  let unhappiest_player = "";
  let unhappiest_player_value = 0;
  let fun_percentage = 0;
  let neutral_percentage = 0;
  let not_fun_percentage = 0;

  sessions_number = sessions.length;
  let team_sessions = new Map();
  let first_session = new Date(sessions[0].date.seconds * 1000);
  let last_session = new Date(
    sessions[sessions.length - 1].date.seconds * 1000,
  );
  let timestamp_of_seven_days_ago =
    new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
  let games_played_last_week = new Map();
  let player_last_week = new Map();
  let player_happiness = new Map(); //key: team_id, value: [number_of_good_games, total_number_of_games]
  let cpt_fun = 0;
  let cpt_neutral = 0;
  let cpt_not_fun = 0;

  //loop through all the sessions for all the stats
  for (let session of sessions) {
    //=================team_with_most_sessions=============
    //get the team with the most sessions and the average duration of number
    if (team_sessions.has(session.team)) {
      team_sessions.get(session.team).push(session.duration);
    } else {
      team_sessions.set(session.team, [session.duration]);
    }

    //============average_session_per_day===============
    //verify if the session is before the current first session
    if (new Date(session.date.seconds * 1000) < first_session) {
      first_session = new Date(session.date.seconds * 1000);
    }
    //verify if the session is after the current last one
    if (new Date(session.date.seconds * 1000) > last_session) {
      last_session = new Date(session.date.seconds * 1000);
    }

    //=================game_of_the_week and player_of_the_week================
    //get the game, the player and the unhappiest player of the week
    if (session.date.seconds * 1000 > timestamp_of_seven_days_ago) {
      //game of the week
      if (games_played_last_week.has(session.game)) {
        games_played_last_week.set(
          session.game,
          games_played_last_week.get(session.game) + session.duration,
        );
      } else {
        games_played_last_week.set(session.game, session.duration);
      }

      //player of the week
      if (player_last_week.has(session.team)) {
        player_last_week.set(
          session.team,
          player_last_week.get(session.team) + session.duration,
        );
      } else {
        player_last_week.set(session.team, session.duration);
      }

      //unhappiest player
      if (player_happiness.has(session.team)) {
        player_happiness.get(session.team)[1]++;
        if (session.was_cool) {
          player_happiness.get(session.team)[0]++;
        }
      } else {
        player_happiness.set(session.team, [
          session.was_cool !== undefined ? session.was_cool : 0,
          1,
        ]);
      }
    }
    //==================fun_percentage, neutral_percentage, not_fun_percentage================
    if (session.was_cool === undefined) cpt_neutral++;
    else if (session.was_cool) cpt_fun++;
    else cpt_not_fun++;
  }

  //set team with most sessions and team with the greatest session average playtime
  let max_session = 0;
  let team_session = "";
  let max_average = 0;
  let team_average = "";
  for (let [key, value] of team_sessions) {
    //team with most sessions
    if (value.length > max_session) {
      max_session = value.length;
      team_session = key;
    }
    //team with the greatest session average playtime
    let sum = 0;
    value.forEach((element) => {
      sum += element;
    });
    let average = sum / value.length;
    if (average > max_average) {
      max_average = average;
      team_average = key;
    }
  }
  team_with_most_sessions = teams.find((t) => t.id === team_session).name;
  team_with_most_sessions_value = max_session;
  team_with_greatest_session_average_playtime = teams.find(
    (t) => t.id === team_average,
  ).name;
  team_with_greatest_session_average_playtime_value = max_average;

  //get the number of day between the first and the last session
  let diffTime = Math.abs(last_session - first_session);
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0 || isNaN(diffDays)) {
    //we don't want to divide by 0
    diffDays = 1;
  }
  average_session_per_day = sessions.length / diffDays;

  //get the number of games
  number_of_games = games.length;

  //get the game of the week
  let max_game = 0;
  let game_id = "";
  for (let [key, value] of games_played_last_week) {
    if (value > max_game) {
      max_game = value;
      game_id = key;
    }
  }
  game_of_the_week = games.find((g) => g.id === game_id)
    ? games.find((g) => g.id === game_id).name
    : "";
  game_of_the_week_time = max_game;

  //get the player of the week and the second player of the week
  const player_last_week_sorted = [...player_last_week.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  let player_id;
  let second_player_id;
  if (player_last_week_sorted.length === 0) {
    player_id = "";
    second_player_id = "";
  } else if (player_last_week_sorted.length === 1) {
    player_id = player_last_week_sorted[0][0];
    second_player_id = "";
  } else {
    player_id = player_last_week_sorted[0][0];
    second_player_id = player_last_week_sorted[1][0];
  }

  player_of_the_week = teams.find((t) => t.id === player_id)
    ? teams.find((t) => t.id === player_id).name
    : "";
  second_player_of_the_week = teams.find((t) => t.id === second_player_id)
    ? teams.find((t) => t.id === second_player_id).name
    : "";
  if (second_player_of_the_week !== "")
    difference_between_player_of_the_week =
      player_last_week_sorted[0][1] - player_last_week_sorted[1][1];
  else difference_between_player_of_the_week = 0;

  //get the unhappiest player
  let min_happiness = 1;
  let team_id = "";
  for (let [key, value] of player_happiness) {
    let happiness = value[0] / value[1];
    if (happiness < min_happiness) {
      min_happiness = happiness;
      team_id = key;
    }
  }
  unhappiest_player = teams.find((t) => t.id === team_id)
    ? teams.find((t) => t.id === team_id).name
    : "";
  unhappiest_player_value = min_happiness * 100;

  //set the percentages of good,neutral and bad games
  neutral_percentage = (cpt_neutral / sessions.length) * 100;
  not_fun_percentage = (cpt_not_fun / sessions.length) * 100;
  fun_percentage = (cpt_fun / sessions.length) * 100;

  self.postMessage({
    finished: true,
    _sessions_number: JSON.parse(JSON.stringify(sessions_number)),
    _team_with_most_sessions: JSON.parse(
      JSON.stringify(team_with_most_sessions),
    ),
    _team_with_most_sessions_value: JSON.parse(
      JSON.stringify(team_with_most_sessions_value),
    ),
    _average_session_per_day: JSON.parse(
      JSON.stringify(average_session_per_day),
    ),
    _team_with_greatest_session_average_playtime: JSON.parse(
      JSON.stringify(team_with_greatest_session_average_playtime),
    ),
    _team_with_greatest_session_average_playtime_value: JSON.parse(
      JSON.stringify(team_with_greatest_session_average_playtime_value),
    ),
    _number_of_games: JSON.parse(JSON.stringify(number_of_games)),
    _game_of_the_week: JSON.parse(JSON.stringify(game_of_the_week)),
    _game_of_the_week_time: JSON.parse(JSON.stringify(game_of_the_week_time)),
    _player_of_the_week: JSON.parse(JSON.stringify(player_of_the_week)),
    _second_player_of_the_week: JSON.parse(
      JSON.stringify(second_player_of_the_week),
    ),
    _difference_between_player_of_the_week: JSON.parse(
      JSON.stringify(difference_between_player_of_the_week),
    ),
    _unhappiest_player: JSON.parse(JSON.stringify(unhappiest_player)),
    _unhappiest_player_value: JSON.parse(
      JSON.stringify(unhappiest_player_value),
    ),
    _fun_percentage: JSON.parse(JSON.stringify(fun_percentage)),
    _neutral_percentage: JSON.parse(JSON.stringify(neutral_percentage)),
    _not_fun_percentage: JSON.parse(JSON.stringify(not_fun_percentage)),
  });
}
