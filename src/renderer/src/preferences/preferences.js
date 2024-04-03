const defaults = {
    "pie_chart_labels_shown": true,
    "pie_chart_use_custom_colors": false,
    "add_session_key_shortcut": "n",
    "add_session_with_name_key_shortcut_1": "b",
    "add_session_with_name_game_name_1": "",
    "add_session_with_name_key_shortcut_2": "v",
    "add_session_with_name_game_name_2": "",
    "sort_order_team_list": "playtime",
};

const preferences_name = "preferences";

export function getPreferences(name) {
    const userPreference = JSON.parse(localStorage.getItem(preferences_name));
    if(userPreference === null) {
        return defaults[name];
    }
    if(userPreference[name] === undefined)
        return defaults[name];
    return userPreference[name];
}

export function setPreferences(name, value) {
    let userPreference = JSON.parse(localStorage.getItem(preferences_name));
    if(userPreference === null) {
        userPreference = defaults;
    }
    userPreference[name] = value;
    localStorage.setItem(preferences_name, JSON.stringify(userPreference));
}