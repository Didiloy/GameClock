const defaults = {
    "pie_chart_labels_shown": true,
    "pie_chart_use_custom_colors": false,
    "add_session_key_shortcut": "n",
    "sort_order_team_list": "playtime",
};

const preferences_name = "preferences";

export function getPreferences(name) {
    const userPreference = JSON.parse(localStorage.getItem(preferences_name));
    if(userPreference === null) {
        return defaults[name];
    }
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