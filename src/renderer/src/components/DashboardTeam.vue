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
      <GamesFunPercentage
        class="dt-fun-percentage"
        :teamName="props.teamName"
        :sessions="props.sessions"
      ></GamesFunPercentage>
      <BarChartAllGames
        class="dt-bar-chart"
        :teamName="props.teamName"
        :sessions="props.sessions"
        backgroundColor="#ffdbcb"
        titleColor="#341100"
      ></BarChartAllGames>
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
        :name="total_fun_percentage + '%'"
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
  setTimeout(() => {
    init();
    loaded.value = true;
  }, 500);
});

function init() {
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);
  total_time.value = calculateTotalTime();
  team_time.value = calculateTeamTime();
  sessions_number.value = getNumberOfSessions();
  ranking.value = calculateRanking(props.teamName);
  number_of_games.value = getNumberOfGames();
  total_fun_percentage.value = getTotalFunPercentage();
  team_average_session_duration.value = calculateAverageSessionDuration();
  [biggest_session.value, game_of_biggest_session.value] =
    calculateBiggestSession();
}

const biggest_session = ref(0);
const game_of_biggest_session = ref("");
function calculateBiggestSession() {
  if (id_of_team.value.length === 0) return [0, ""];
  let cpt = 0;
  let game_id = "";
  if (props.sessions === undefined) {
    sessions.value.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        if (cpt > element.duration) {
          return;
        }
        cpt = element.duration;
        game_id = element.game.id;
      }
    });
  } else {
    props.sessions.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        if (cpt > element.duration) {
          return;
        }
        cpt = element.duration;
        game_id = element.game.id;
      }
    });
  }
  return [cpt, getGameNameById(game_id)];
}

function getGameNameById(id) {
  if (id === "") return;
  return games.value.find((element) => element.id === id).name;
}

const team_average_session_duration = ref(0);
function calculateAverageSessionDuration() {
  if (id_of_team.value.length === 0) return 0;
  let cpt = 0;
  if (props.sessions === undefined) {
    sessions.value.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        cpt += element.duration;
      }
    });
  } else {
    props.sessions.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        cpt += element.duration;
      }
    });
  }
  cpt = (cpt / sessions_number.value).toFixed(2);
  return cpt;
}

const sessions_number = ref(0);

function getNumberOfSessions() {
  if (id_of_team.value.length === 0) return 0;
  let cpt = 0;
  if (props.sessions === undefined) {
    sessions.value.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        cpt++;
      }
    });
  } else {
    props.sessions.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        cpt++;
      }
    });
  }
  return cpt;
}

const total_time = ref(0);
const team_time = ref(0);
const team_time_hours = computed(() => {
  return convertMinuteToHoursMinute(team_time.value);
});
const percentage_total_time = computed(() => {
  return ((team_time.value / total_time.value) * 100).toFixed(2) + "%";
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

function calculateTeamTime() {
  if (id_of_team.value.length === 0) return 0;
  let cpt = 0;
  if (props.sessions === undefined) {
    sessions.value.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        cpt += element.duration;
      }
    });
  } else {
    props.sessions.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        cpt += element.duration;
      }
    });
  }
  return cpt;
}

const number_of_games = ref(0);

function getNumberOfGames() {
  if (id_of_team.value.length === 0) return 0;
  let cpt = 0;
  let played_games = [];
  if (props.sessions === undefined) {
    sessions.value.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        if (!played_games.includes(element.game.id)) {
          played_games.push(element.game.id);
          cpt++;
        }
      }
    });
  } else {
    props.sessions.forEach((element) => {
      if (id_of_team.value.includes(element.team.id)) {
        if (!played_games.includes(element.game.id)) {
          played_games.push(element.game.id);
          cpt++;
        }
      }
    });
  }
  //for deleted games the game is not in the games list even if we have the id
  //so we need to check if the game is in the games list
  for (let g of played_games) {
    if (games.value.filter((game) => game.id === g).length === 0) {
      cpt--;
    }
  }
  return cpt;
}

const ranking = ref(0);
const ranking_computed = computed(() => {
  return ranking.value;
});

function calculateRanking(teamName) {
  //if its a mix of multiple teams we don't calculate it
  if (teamName.split(",").length > 1) {
    return "N/A";
  }
  //calculate the playtime of all teams
  let playtime = [];
  for (let t of teams.value) {
    let cpt = 0;
    sessions.value.forEach((element) => {
      if (element.team.id === t.id) {
        cpt += element.duration;
      }
    });
    playtime.push({ team: t.name, time: cpt });
  }

  playtime.sort((a, b) => {
    return b.time - a.time;
  });

  let cpt = 1;
  for (let p of playtime) {
    if (p.team === teamName) {
      return cpt;
    }
    cpt++;
  }
  return cpt;
}

const total_fun_percentage = ref(0);

function getTotalFunPercentage() {
  let tmp;
  if (props.sessions === undefined) {
    tmp = sessions.value.filter((s) => id_of_team.value.includes(s.team.id));
  } else {
    tmp = props.sessions.filter((s) => id_of_team.value.includes(s.team.id));
  }
  let cpt = 0;
  tmp.map((s) => (cpt += s.was_cool ? 1 : 0));
  return ((cpt / tmp.length) * 100).toFixed(0);
}
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

.dt-fun-percentage {
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 3;
  grid-row-end: 7;
}

.dt-bar-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 10;
  grid-row-start: 7;
  grid-row-end: 11;
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
</style>
