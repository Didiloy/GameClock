<template>
  <div v-if="!loaded">
    <Loading msg="calculating_statistics" />
  </div>
  <div v-else class="dv-container">
    <div class="dv-dashboard">
      <LittleCard
        class="dv-lc-player-of-the-week"
        iconName="pi pi-trophy"
        backgroundColor="#ffdbcb"
        titleColor="#341100"
        :name="player_of_the_week"
        :value="
          player_of_the_week === ''
            ? i18n.t('Dashboard.no_player_of_the_week')
            : second_player_of_the_week === ''
              ? i18n.t('Dashboard.only_player_of_the_week')
              : i18n.t('Dashboard.player_of_the_week', [
                  second_player_of_the_week,
                  convertMinuteToHoursMinute(
                    difference_between_player_of_the_week,
                  ),
                ])
        "
      ></LittleCard>
      <LittleCard
        class="dv-lc-most-session"
        iconName="pi pi-user"
        backgroundColor="#e8defa"
        titleColor="#1e182c"
        :name="team_with_most_sessions"
        :value="
          i18n.t('Dashboard.have_most_sessions_part_one') +
          team_with_most_sessions_value +
          i18n.t('Dashboard.have_most_sessions_part_two')
        "
      ></LittleCard>
      <LittleCard
        class="dv-lc-average-session-day"
        :iconValue="numberIcon"
        backgroundColor="#f9e09f"
        titleColor="#241a00"
        :name="average_session_per_day?.toFixed(2)"
        :value="i18n.t('Dashboard.average_session_per_day')"
      ></LittleCard>
      <LittleCard
        class="dv-lc-sessions"
        :iconValue="spinningClock"
        backgroundColor="#e8defa"
        titleColor="#1e182c"
        :name="team_with_greatest_session_average_playtime"
        :value="
          i18n.t('Dashboard.biggest_games_sessions_part_one') +
          convertMinuteToHoursMinute(
            team_with_greatest_session_average_playtime_value,
          ) +
          i18n.t('Dashboard.biggest_games_sessions_part_two')
        "
      ></LittleCard>
      <LittleCard
        class="dv-lc-game-number"
        iconName="pi pi-sort-amount-up"
        backgroundColor="#c5eae7"
        titleColor="#00201f"
        :name="number_of_games"
        :value="i18n.t('Dashboard.games_played')"
      ></LittleCard>
      <LittleCard
        class="dv-lc-game-of-the-week"
        :iconValue="gameIcon"
        backgroundColor="#f9e09f"
        titleColor="#241a00"
        :name="game_of_the_week"
        :value="
          game_of_the_week === ''
            ? i18n.t('Dashboard.no_game_of_the_week')
            : i18n.t('Dashboard.game_of_the_week', [
                convertMinuteToHoursMinute(game_of_the_week_time),
              ])
        "
      ></LittleCard>
      <LittleCard
        class="dv-lc-unhappiest"
        :iconValue="sadIcon"
        backgroundColor="#c5eae7"
        titleColor="#00201f"
        :name="unhappiest_player"
        :value="
          i18n.t('Dashboard.unhappiest_player', [
            unhappiest_player_value ? unhappiest_player_value.toFixed(0) : 0,
          ])
        "
      ></LittleCard>
      <LittleCard
        class="dv-lc-sessions-number"
        iconName="pi pi-asterisk"
        backgroundColor="#ffdbcb"
        titleColor="#341100"
        :name="sessions_number"
        :value="i18n.t('Dashboard.sessions_played')"
      ></LittleCard>
      <PlayTimeHome
        class="dv-play-time-home"
        backgroundColor="#c1f18f"
        titleColor="#0e2000"
      ></PlayTimeHome>
      <GameTimeHome
        class="dv-pie-chart"
        backgroundColor="#e8defa"
        titleColor="#1e182c"
      ></GameTimeHome>
      <LittleCard
        class="dv-lc-percentage"
        iconName="pi pi-heart-fill"
        backgroundColor="#f7d8fe"
        titleColor="#27142f"
        :name="fun_percentage_computed"
        :value="percentage_card_computed"
      ></LittleCard>
      <LineChartPlayerOfTheWeek
        class="dv-line-chart-player-week"
        backgroundColor="#ffdbd0"
        titleColor="#390b00"
      ></LineChartPlayerOfTheWeek>
      <BarChartAllGames
        class="dv-bar-all-game"
        backgroundColor="#dae1ff"
        titleColor="#001849"
      ></BarChartAllGames>
      <PieChartPlatform
        class="dv-pie-chart-platform"
        backgroundColor="#e8defa"
        titleColor="#1e182c"
      ></PieChartPlatform>
      <GamesFunPercentage
        class="dv-fun-percentage"
        backgroundColor="#ffdbd0"
        titleColor="#390b00"
      ></GamesFunPercentage>
    </div>
    <div class="session-history">
      <SessionsHistory
        :historySize="getPreferences('number_of_last_sessions')"
        :title="
          getPreferences('number_of_last_sessions') +
          ' ' +
          i18n.t('Dashboard.last_sessions')
        "
      />
    </div>
  </div>
</template>
<script setup>
import LittleCard from "./LittleCard.vue";
import Loading from "../components/Loading.vue";
import { useStore } from "../store/store";
import { computed, onMounted, ref } from "vue";
import GameTimeHome from "./PieChartGamePercentage.vue";
import BarChartAllGames from "./BarChartAllGames.vue";
import PlayTimeHome from "./PlayTimeHome.vue";
import PieChartPlatform from "./DoughnutChartPlatform.vue";
import GamesFunPercentage from "./GamesFunPercentage.vue";
import SessionsHistory from "./SessionsHistory.vue";
import LineChartPlayerOfTheWeek from "./LineChartPlayerOfTheWeek.vue";
import { getPreferences } from "../preferences/preferences";
import { convertMinuteToHoursMinute } from "../common/main";
import gameIcon from "../assets/images/icons_games.svg";
import sadIcon from "../assets/images/sad_icon.svg";
import numberIcon from "../assets/images/icon_number.svg";
import spinningClock from "../assets/images/spinning_clock.svg";

import { useI18n } from "vue-i18n";

const i18n = useI18n();

const loaded = ref(false);

const props = defineProps(["teamName"]);

const store = useStore();

onMounted(() => {
  initDashboard();
});

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

function initDashboard() {
  const worker = new Worker(
    new URL("../workers/dashboard.js", import.meta.url),
  );

  worker.onmessage = (event) => {
    if (event.data.finished) {
      const {
        _sessions_number,
        _team_with_most_sessions,
        _team_with_most_sessions_value,
        _average_session_per_day,
        _team_with_greatest_session_average_playtime,
        _team_with_greatest_session_average_playtime_value,
        _number_of_games,
        _game_of_the_week,
        _game_of_the_week_time,
        _player_of_the_week,
        _second_player_of_the_week,
        _difference_between_player_of_the_week,
        _unhappiest_player,
        _unhappiest_player_value,
        _fun_percentage,
        _neutral_percentage,
        _not_fun_percentage,
      } = event.data;
      sessions_number.value = _sessions_number;
      team_with_most_sessions.value = _team_with_most_sessions;
      team_with_most_sessions_value.value = _team_with_most_sessions_value
        ? _team_with_most_sessions_value
        : 0;
      average_session_per_day.value = _average_session_per_day;
      team_with_greatest_session_average_playtime.value =
        _team_with_greatest_session_average_playtime;
      team_with_greatest_session_average_playtime_value.value =
        _team_with_greatest_session_average_playtime_value;
      number_of_games.value = _number_of_games;
      game_of_the_week.value = _game_of_the_week;
      game_of_the_week_time.value = _game_of_the_week_time;
      player_of_the_week.value = _player_of_the_week;
      second_player_of_the_week.value = _second_player_of_the_week;
      difference_between_player_of_the_week.value =
        _difference_between_player_of_the_week;
      unhappiest_player.value = _unhappiest_player;
      unhappiest_player_value.value = _unhappiest_player_value;
      fun_percentage.value = _fun_percentage;
      neutral_percentage.value = _neutral_percentage;
      not_fun_percentage.value = _not_fun_percentage;
      loaded.value = true;
      worker.terminate();
    }
  };

  worker.onerror = (error) => {
    console.error(`Dashboard worker error: ${error.message}`);
    worker.terminate();
  };

  const sessions = store.sessions.map((session) => {
    return {
      ...session,
      game: session.game.id,
      team: session.teams,
      platform: session.platform?.id,
    };
  });

  worker.postMessage({
    sessions: JSON.parse(JSON.stringify(sessions)),
    games: JSON.parse(JSON.stringify(store.games)),
    teams: JSON.parse(JSON.stringify(store.teams)),
  });
}

const fun_percentage_computed = computed(() => {
  return fun_percentage.value ? fun_percentage.value.toFixed(2) + "%" : "0%";
});

const percentage_card_computed = computed(() => {
  return `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <b>${i18n.t("Dashboard.fun_to_play")}</b><br><h2>${i18n.t("Dashboard.neutral")}:</h2> ${neutral_percentage.value ? neutral_percentage.value.toFixed(2) : "0"}% <br><h2>${i18n.t("Dashboard.bad")}:</h2> ${not_fun_percentage.value ? not_fun_percentage.value.toFixed(2) : "0"}%
          </div>`;
});
</script>
<style scoped>
.dv-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
}

.session-history {
  width: 100%;
  height: 100%;
  padding-left: 15px;
  padding-right: 15px;
}

.dv-dashboard {
  display: grid;
  column-gap: 10px;
  row-gap: 10px;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 100px;
  padding: 15px;
}

.dv-lc-player-of-the-week {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 5;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dv-lc-most-session {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 5;
  grid-column-end: 7;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dv-lc-average-session-day {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 9;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dv-lc-sessions {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 9;
  grid-column-end: 13;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dv-lc-game-number {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 3;
  grid-row-end: 5;
}

.dv-lc-game-of-the-week {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 3;
  grid-column-end: 7;
  grid-row-start: 3;
  grid-row-end: 5;
}

.dv-lc-sessions-number {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 11;
  grid-column-end: 13;
  grid-row-start: 3;
  grid-row-end: 5;
}

.dv-lc-unhappiest {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 11;
  grid-row-start: 3;
  grid-row-end: 5;
}

.dv-play-time-home {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 7;
  grid-row-start: 5;
  grid-row-end: 9;
}

.dv-pie-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 5;
  grid-row-end: 9;
}

.dv-lc-percentage {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 9;
  grid-row-end: 13;
}

.dv-line-chart-player-week {
  width: 100%;
  height: 100%;
  grid-column-start: 4;
  grid-column-end: 13;
  grid-row-start: 9;
  grid-row-end: 13;
}

.dv-bar-all-game {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 13;
  grid-row-start: 13;
  grid-row-end: 17;
}

.dv-pie-chart-platform {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 7;
  grid-row-start: 17;
  grid-row-end: 21;
}

.dv-fun-percentage {
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 17;
  grid-row-end: 21;
}
</style>
