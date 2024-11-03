const defaults = {
  //pie chart
  pie_chart_labels_shown: false,
  pie_chart_use_custom_colors: false,
  //add session
  add_session_key_shortcut: "n",
  add_session_with_name_key_shortcut_1: "b",
  add_session_with_name_game_name_1: "",
  add_session_with_name_key_shortcut_2: "v",
  add_session_with_name_game_name_2: "",
  reload_data_after_adding_session: true,
  add_session_from_homepage_key_shortcut: "h",
  add_session_from_homepage_team_name: "",
  add_session_from_homepage_game_name: "",
  //team list
  sort_order_team_list: "playtime",
  display_successes_in_team_list: true,
  //database
  selected_database_index: 0,
  //chronometer
  toggle_chronometer_key_shortcut: "p",
  last_chronometer_value: 0,
  //start page
  default_start_page: "",
  default_start_page_route: "/",
  number_of_last_sessions: 5,
  //colors
  use_logo_color_in_team_list: false,
  use_logo_color_in_session_history: false,
  //language
  language: "en",
  //data loading
  reload_data_key_shortcut: "r",
  //graph zoom
  activate_zoom_on_graphs: false,
};

const preferences_name = "preferences";

export function getPreferences(name) {
  const userPreference = JSON.parse(localStorage.getItem(preferences_name));
  if (userPreference === null) {
    return defaults[name];
  }
  if (userPreference[name] === undefined) return defaults[name];
  return userPreference[name];
}

export function setPreferences(name, value) {
  let userPreference = JSON.parse(localStorage.getItem(preferences_name));
  if (userPreference === null) {
    userPreference = defaults;
  }
  userPreference[name] = value;
  localStorage.setItem(preferences_name, JSON.stringify(userPreference));
}
