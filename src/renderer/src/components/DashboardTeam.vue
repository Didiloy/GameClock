<template>
  <div v-if="!loaded">
    <Loading msg="calculating_statistics" />
  </div>
  <div v-else class="dt-container">
    <div class="dt-dashboard">
      <LittleCard
        class="dt-lc-total-time"
        :iconValue="spinningClock"
        backgroundColor="#d4e7dc"
        titleColor="#0f1f18"
        :name="team_time_hours"
        :value="
          i18n.t('DashboardTeam.team_time', {
            percentage_total_time: percentage_total_time,
          })
        "
      ></LittleCard>
      <LittleCard
        class="dt-lc-average-time"
        iconName="pi pi-hourglass"
        backgroundColor="#a6abfe"
        titleColor="#0f1f18"
        :name="convertMinuteToHoursMinute(team_average_session_duration)"
        :value="i18n.t('DashboardTeam.average_time')"
      ></LittleCard>
      <LittleCard
        iconName="pi pi-hashtag"
        class="dt-lc-position"
        :name="ranking_computed"
        backgroundColor="#f7d8fe"
        titleColor="#27142f"
        :value="i18n.t('DashboardTeam.position_in_ranking')"
      ></LittleCard>
      <GameTimeHome
        class="dt-pie-chart"
        :teamName="props.teamName"
        :sessions="props.sessions"
        backgroundColor="#f9e09f"
        titleColor="#241a00"
      ></GameTimeHome>
      <LineChartLastMonth
        class="dt-line-last-days"
        :teamName="props.teamName"
        :sessions="props.sessions"
        backgroundColor="#c5eae7"
        titleColor="#00201f"
      />
      <GamesFunPercentage
        class="dt-fun-percentage"
        :teamName="props.teamName"
        :sessions="props.sessions"
      ></GamesFunPercentage>
      <LittleCard
        class="dt-lc-book-read"
        iconName="pi pi-book"
        backgroundColor="#c5eae7"
        titleColor="#00201f"
        :name="number_of_books"
        :value="i18n.t('DashboardTeam.text_books')"
      ></LittleCard>
      <LittleCard
        class="dt-lc-biggest-session"
        iconName="pi pi-hourglass"
        backgroundColor="#a6abfe"
        titleColor="#0f1f18"
        :name="convertMinuteToHoursMinute(biggest_session)"
        :value="
          i18n.t('DashboardTeam.biggest_session', [game_of_biggest_session])
        "
      ></LittleCard>
      <TopGamesLittleGameCard
        :teamName="props.teamName"
        class="dt-top-card"
      ></TopGamesLittleGameCard>
      <LittleCard
        class="dt-lc-movies"
        iconName="pi pi-youtube"
        :name="number_of_movies"
        backgroundColor="#f9e09f"
        titleColor="#241a00"
        :value="i18n.t('DashboardTeam.text_movies')"
      ></LittleCard>
      <LittleCard
        class="dt-lc-joy-all-game"
        iconName="pi pi-thumbs-up"
        :name="isNaN(total_fun_percentage) ? '0%' : total_fun_percentage + '%'"
        backgroundColor="#90a1b9"
        titleColor="#303a48"
        :value="i18n.t('DashboardTeam.fun_to_play')"
      ></LittleCard>
      <LineChartGameByMonth
        class="dt-line-chart"
        :teamName="props.teamName"
        backgroundColor="#e8defa"
        titleColor="#1e182c"
      ></LineChartGameByMonth>
      <LittleCard
        class="dt-lc-game-number"
        iconName="pi pi-sort-amount-up"
        backgroundColor="#ffdbcb"
        titleColor="#341100"
        :name="number_of_games"
        :value="i18n.t('DashboardTeam.games_played')"
      ></LittleCard>
      <LittleCard
        class="dt-lc-todo"
        iconName="pi pi-list"
        :name="sessions_number"
        backgroundColor="#dae1ff"
        titleColor="#001849"
        :value="i18n.t('DashboardTeam.games_sessions')"
      ></LittleCard>
      <BarChartAllGames
        class="dt-bar-chart"
        :teamName="props.teamName"
        :sessions="props.sessions"
        backgroundColor="#ffdbcb"
        titleColor="#341100"
      ></BarChartAllGames>
      <Heatmap :sessions="props.sessions" class="dt-heatmap" />
    </div>
    <SessionsHistory :teamName="props.teamName" />
  </div>
</template>
<script setup>
import LineChartGameByMonth from "./LineChartGameByMonth.vue";
import GameTimeHome from "./PieChartGamePercentage.vue";
import LittleCard from "./LittleCard.vue";
import BarChartAllGames from "../components/BarChartAllGames.vue";
import TopGamesLittleGameCard from "./TopGamesLittleGameCard.vue";
import GamesFunPercentage from "./GamesFunPercentage.vue";
import Heatmap from "./Heatmap.vue";
import LineChartLastMonth from "./LineChartLastMonth.vue";
import Loading from "./Loading.vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import SessionsHistory from "./SessionsHistory.vue";
import { convertMinuteToHoursMinute } from "../common/main";
import { getIdsOfTeam } from "../database/database";
import spinningClock from "../assets/images/spinning_clock.svg";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const props = defineProps(["teamName", "sessions"]);

const store = useStore();
const { sessions, games, teams } = storeToRefs(store);
const id_of_team = ref([]);
const loaded = ref(false);

onMounted(() => {
  init();
});

watch(
  () => props.teamName,
  () => {
    init();
  },
);

watch(
  () => props.sessions,
  () => {
    init();
  },
);

function init() {
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);
  let ids_of_team = getIdsOfTeam(props.teamName, teams.value);
  total_time.value = calculateTotalTime();

  const _games = games.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const _sessions =
    props.sessions !== undefined
      ? props.sessions.map((item) => ({
          duration: item.duration,
          date: item.date.seconds,
          was_cool: item.was_cool,
          id: item.id,
          teams: item.teams.map((team) => team),
          game: { id: item.game.id },
        }))
      : sessions.value.map((item) => ({
          duration: item.duration,
          date: item.date.seconds,
          was_cool: item.was_cool,
          id: item.id,
          teams: item.teams.map((team) => team),
          game: { id: item.game.id },
        }));

  const _teams = teams.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  window.electron.ipcRenderer.send("dashboardteam", {
    ids_of_team: ids_of_team,
    games: _games,
    sessions: _sessions,
    teams: _teams,
  });

  calculateRanking(ids_of_team, sessions.value, teams.value);
}

window.electron.ipcRenderer.on("result_dashboardteam", (event, data) => {
  team_time.value = data.team_time;
  sessions_number.value = data.sessions_number;
  number_of_games.value = data.number_of_games;
  total_fun_percentage.value = data.total_fun_percentage;
  team_average_session_duration.value = data.team_average_session_duration;
  biggest_session.value = data.biggest_session;
  game_of_biggest_session.value = data.game_of_biggest_session;
  loaded.value = true;
});

const biggest_session = ref(0);
const game_of_biggest_session = ref("");
const team_average_session_duration = ref(0);
const sessions_number = ref(0);
const total_time = ref(0);
const team_time = ref(0);
const team_time_hours = computed(() => {
  return convertMinuteToHoursMinute(team_time.value);
});
const percentage_total_time = computed(() => {
  return isNaN((team_time.value / total_time.value) * 100)
    ? "0%"
    : ((team_time.value / total_time.value) * 100).toFixed(2) + "%";
});

const average_book_reading_time = ref(178);
const number_of_books = computed(() => {
  return (team_time.value / average_book_reading_time.value).toFixed(0);
});

const average_movie_time = ref(110);
const number_of_movies = computed(() => {
  return (team_time.value / average_movie_time.value).toFixed(0);
});

function calculateTotalTime() {
  let cpt = 0;
  sessions.value.forEach((element) => {
    cpt += element.duration;
  });
  return cpt;
}

function calculateRanking(ids_of_team, sessions, teams) {
  //if its a mix of multiple teams we don't calculate it
  if (ids_of_team.length > 1) {
    ranking.value = "N/A";
    return;
  }

  //calculate the playtime of all teams
  let playtime = [];
  for (let t of teams) {
    let cpt = 0;
    sessions.forEach((element) => {
      if (element.teams.some((team) => t.id === team)) {
        cpt += element.duration;
      }
    });
    playtime.push({ team: t.id, time: cpt });
  }

  playtime.sort((a, b) => {
    return b.time - a.time;
  });

  let cpt = 1;
  for (let p of playtime) {
    if (p.team === ids_of_team[0]) {
      ranking.value = cpt;
      return;
    }
    cpt++;
  }

  ranking.value = cpt;
}

const number_of_games = ref(0);
const ranking = ref(0);
const ranking_computed = computed(() => {
  return ranking.value;
});

const total_fun_percentage = ref(0);
</script>
<style scoped>
.dt-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 98%;
}

.dt-dashboard {
  display: grid;
  column-gap: 10px;
  row-gap: 10px;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 100px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.dt-lc-total-time {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dt-lc-average-time {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 4;
  grid-column-end: 7;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dt-lc-position {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dt-pie-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 7;
  grid-row-start: 3;
  grid-row-end: 7;
}

.dt-line-last-days {
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 3;
  grid-row-end: 7;
}

.dt-lc-book-read {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 10;
  grid-column-end: 13;
  grid-row-start: 7;
  grid-row-end: 9;
}

.dt-lc-biggest-session {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 10;
  grid-column-end: 13;
  grid-row-start: 9;
  grid-row-end: 11;
}

.dt-lc-movies {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 11;
  grid-row-end: 14;
}

.dt-lc-joy-all-game {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 14;
  grid-row-end: 16;
}

.dt-top-card {
  width: 100%;
  height: 100%;
  grid-column-start: 4;
  grid-column-end: 13;
  grid-row-start: 11;
  grid-row-end: 16;
}

.dt-line-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 10;
  grid-row-start: 16;
  grid-row-end: 20;
}

.dt-lc-game-number {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 10;
  grid-column-end: 13;
  grid-row-start: 16;
  grid-row-end: 18;
}

.dt-lc-todo {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 10;
  grid-column-end: 13;
  grid-row-start: 18;
  grid-row-end: 20;
}

.dt-fun-percentage {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 10;
  grid-row-start: 7;
  grid-row-end: 11;
}

.dt-bar-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 13;
  grid-row-start: 20;
  grid-row-end: 24;
}

.dt-heatmap {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 13;
  grid-row-start: 24;
  grid-row-end: 27;
}
</style>
