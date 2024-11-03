import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {nextTick, ref} from "vue";

export function useDashboard() {
    const store = useStore();
    const { sessions, games, teams } = storeToRefs(store);
    const sessions_number = ref(0);
    const team_with_most_sessions = ref("");
    const team_with_most_sessions_value = ref(0);
    const average_session_per_day = ref(0);
    const team_with_greatest_session_average_playtime = ref("");
    const team_with_greatest_session_average_playtime_value = ref(0);
    const number_of_games = ref(0);
    const game_of_the_week = ref("");
    const game_of_the_week_time = ref(0);
    const player_of_the_week = ref("");
    const second_player_of_the_week = ref("");
    const difference_between_player_of_the_week = ref(0);
    const unhappiest_player = ref("");
    const unhappiest_player_value = ref(0);
    const fun_percentage = ref(0);
    const neutral_percentage = ref(0);
    const not_fun_percentage = ref(0);


    async function initDashboard() {
        await nextTick();
        sessions_number.value = sessions.value.length;
        let team_sessions = new Map();
        let first_session = new Date(sessions.value[0].date.seconds * 1000);
        let last_session = new Date(sessions.value[sessions.value.length - 1].date.seconds * 1000);
        let timestamp_of_seven_days_ago = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
        let games_played_last_week = new Map();
        let player_last_week = new Map();
        let player_happiness = new Map(); //key: team_id, value: [number_of_good_games, total_number_of_games]
        let cpt_fun = 0;
        let cpt_neutral = 0;
        let cpt_not_fun = 0;

        //loop through all the sessions for all the stats
        for(let session of sessions.value) {
            //=================team_with_most_sessions=============
            //get the team with the most sessions and the average duration of number
            if (team_sessions.has(session.team.id)) {
                team_sessions.get(session.team.id).push(session.duration);
            } else {
                team_sessions.set(session.team.id, []);
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
                if (games_played_last_week.has(session.game.id)) {
                    games_played_last_week.set(session.game.id, games_played_last_week.get(session.game.id) + session.duration);
                } else {
                    games_played_last_week.set(session.game.id, session.duration);
                }

                //player of the week
                if (player_last_week.has(session.team.id)) {
                    player_last_week.set(session.team.id, player_last_week.get(session.team.id) + session.duration);
                } else {
                    player_last_week.set(session.team.id, session.duration);
                }

                //unhappiest player
                if (player_happiness.has(session.team.id)) {
                    player_happiness.get(session.team.id)[1]++;
                    if(session.was_cool) {
                        player_happiness.get(session.team.id)[0]++;
                    }
                } else {
                    player_happiness.set(session.team.id, [session.was_cool !== undefined ? session.was_cool : 0, 1]);
                }

            }
            //==================fun_percentage, neutral_percentage, not_fun_percentage================
            if (session.was_cool === undefined) cpt_neutral++;
            else if (session.was_cool) cpt_fun++;
            else cpt_not_fun++;
        }

        await nextTick();

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
        team_with_most_sessions.value = teams.value.find(t => t.id === team_session).name;
        team_with_most_sessions_value.value = max_session;
        team_with_greatest_session_average_playtime.value = teams.value.find(t => t.id === team_average).name;
        team_with_greatest_session_average_playtime_value.value = max_average;


        //get the number of day between the first and the last session
        let diffTime = Math.abs(last_session - first_session);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if(diffDays === 0 || isNaN(diffDays)) { //we don't want to divide by 0
            diffDays = 1;
        }
        average_session_per_day.value = (sessions.value.length / diffDays);

        //get the number of games
        number_of_games.value = games.value.length;

        //get the game of the week
        let max_game = 0;
        let game_id = "";
        for (let [key, value] of games_played_last_week) {
            if (value > max_game) {
                max_game = value;
                game_id = key;
            }
        }
        game_of_the_week.value = games.value.find(g => g.id === game_id) ? games.value.find(g => g.id === game_id).name : "";
        game_of_the_week_time.value = max_game;

        //get the player of the week and the second player of the week
        const player_last_week_sorted = [...player_last_week.entries()].sort((a, b) => b[1] - a[1]);
        let player_id;
        let second_player_id;
        if(player_last_week_sorted.length === 0){
            player_id = "";
            second_player_id = "";
        }else if(player_last_week_sorted.length === 1){
            player_id = player_last_week_sorted[0][0];
            second_player_id = "";
        }else {
            player_id = player_last_week_sorted[0][0];
            second_player_id = player_last_week_sorted[1][0];
        }
 
        player_of_the_week.value = teams.value.find(t => t.id === player_id) ? teams.value.find(t => t.id === player_id).name : "";
        second_player_of_the_week.value = teams.value.find(t => t.id === second_player_id) ? teams.value.find(t => t.id === second_player_id).name : "";
        if(second_player_of_the_week.value !== "") difference_between_player_of_the_week.value = player_last_week_sorted[0][1] - player_last_week_sorted[1][1];
        else difference_between_player_of_the_week.value = 0;

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
        unhappiest_player.value = teams.value.find(t => t.id === team_id) ? teams.value.find(t => t.id === team_id).name : "";
        unhappiest_player_value.value = min_happiness * 100;

        //set the percentages of good,neutral and bad games
        neutral_percentage.value = (
            (cpt_neutral / sessions.value.length) *
            100
        )
        not_fun_percentage.value = (
            (cpt_not_fun / sessions.value.length) *
            100
        )
        fun_percentage.value = (cpt_fun / sessions.value.length) * 100;
    }

    return {
        initDashboard,
        sessions_number,
        team_with_most_sessions,
        team_with_most_sessions_value,
        average_session_per_day,
        team_with_greatest_session_average_playtime,
        team_with_greatest_session_average_playtime_value,
        number_of_games,
        game_of_the_week,
        game_of_the_week_time,
        player_of_the_week,
        second_player_of_the_week,
        difference_between_player_of_the_week,
        unhappiest_player,
        unhappiest_player_value,
        fun_percentage,
        neutral_percentage,
        not_fun_percentage,
    }
}