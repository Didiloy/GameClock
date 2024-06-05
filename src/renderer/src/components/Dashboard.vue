<template>
  <div class="dv-container">
    <div class="dv-dashboard">
      <LittleCard
        class="dv-lc-sessions"
        iconName="pi pi-users"
        backgroundColor="#f9e09f"
        titleColor="#241a00"
        :name="team_with_greatest_session_average_playtime"
        :value="
          'Fait les plus grosses sessions de jeu (' +
          convertMinuteToHoursMinute(
            team_with_greatest_session_average_playtime_value
          ) +
          ' en moyenne)'
        "
      ></LittleCard>
      <LittleCard
        class="dv-lc-time-played"
        iconName="pi pi-hourglass"
        backgroundColor="#d4e7dc"
        titleColor="#0f1f18"
        :name="total_time_hours"
        value="passées à jouer"
      ></LittleCard>
      <LittleCard
        class="dv-lc-game-number"
        iconName="pi pi-sort-amount-up"
        backgroundColor="#c5eae7"
        titleColor="#00201f"
        :name="number_of_games + ' jeux joués'"
        value=""
      ></LittleCard>
      <LittleCard
        class="dv-lc-most-session"
        iconName="pi pi-user"
        backgroundColor="#ffdbcb"
        titleColor="#341100"
        :name="team_with_most_sessions"
        :value="
          'A le plus de sessions avec ' +
          team_with_most_sessions_value +
          ' sessions'
        "
      ></LittleCard>
      <GameTimeHome
        class="dv-pie-chart"
        backgroundColor="#e8defa"
        titleColor="#1e182c"
      ></GameTimeHome>
      <BarChartAllGames
        class="dv-bar-all-game"
        backgroundColor="#dae1ff"
        titleColor="#001849"
      ></BarChartAllGames>
      <LittleCard
        class="dv-lc-percentage"
        iconName="pi pi-heart-fill"
        backgroundColor="#f7d8fe"
        titleColor="#27142f"
        :name="fun_percentage_computed"
        :value="percentage_card_computed"
      ></LittleCard>
      <PlayTimeHome
        class="dv-play-time-home"
        backgroundColor="#c1f18f"
        titleColor="#0e2000"
      ></PlayTimeHome>
      <GamesFunPercentage
        class="dv-fun-percentage"
        backgroundColor="#ffdbd0"
        titleColor="#390b00"
      ></GamesFunPercentage>
    </div>
    <SessionsHistory
      :historySize="getPreferences('number_of_last_sessions')"
      :title="
        getPreferences('number_of_last_sessions') +
        ' dernières sessions entrées'
      "
    />
  </div>
</template>
<script setup>
import LittleCard from "./LittleCard.vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import GameTimeHome from "./PieChartGamePercentage.vue";
import BarChartAllGames from "./BarChartAllGames.vue";
import PlayTimeHome from "./PlayTimeHome.vue";
import GamesFunPercentage from "./GamesFunPercentage.vue";
import SessionsHistory from "./SessionsHistory.vue";
import { getPreferences } from "../preferences/preferences";

const props = defineProps(["teamName"]);

const store = useStore();
const { sessions, games, teams } = storeToRefs(store);

onMounted(() => {
  init();
});

watch(sessions, () => {
  init();
});

async function init() {
  total_time.value = calculateTotalTime();
  number_of_games.value = getNumberOfGames();
  fun_percentage.value = calculateFunPercentage();
  getTeamWithGreatestSessionAveragePlaytime();
}

const team_with_greatest_session_average_playtime = ref("");
const team_with_greatest_session_average_playtime_value = ref(0);
const team_with_most_sessions = ref("");
const team_with_most_sessions_value = ref(0);

function getTeamWithGreatestSessionAveragePlaytime() {
  let teams_tmp = [];
  let teams_playtime_on_average = [];
  let teams_sessions = [];
  for (let t of teams.value) {
    teams_tmp.push(t.name);
    let cpt = 0;
    let nb = 0;
    sessions.value.forEach((element) => {
      if (element.team.id === t.id) {
        cpt += element.duration;
        nb++;
      }
    });
    teams_playtime_on_average.push(cpt / nb);
    teams_sessions.push(nb);
  }
  for (let i = 0; i < teams_playtime_on_average.length; i++) {
    if (
      teams_playtime_on_average[i] >
      team_with_greatest_session_average_playtime_value.value
    ) {
      team_with_greatest_session_average_playtime_value.value =
        teams_playtime_on_average[i];
      team_with_greatest_session_average_playtime.value = teams_tmp[i];
    }
    if (teams_sessions[i] > team_with_most_sessions_value.value) {
      team_with_most_sessions_value.value = teams_sessions[i];
      team_with_most_sessions.value = teams_tmp[i];
    }
  }
  team_with_greatest_session_average_playtime_value.value = Math.round(
    team_with_greatest_session_average_playtime_value.value
  );
}

const total_time = ref(0);
const total_time_hours = computed(() => {
  return convertMinuteToHoursMinute(total_time.value);
});

function convertMinuteToHoursMinute(minute) {
  return (
    (minute - (minute % 60)) / 60 + "h" + (minute % 60 === 0 ? "" : minute % 60)
  );
}

function calculateTotalTime() {
  let cpt = 0;
  sessions.value.forEach((element) => {
    cpt += element.duration;
  });
  return cpt;
}

const number_of_games = ref(0);

function getNumberOfGames() {
  return games.value.length;
}

const fun_percentage = ref(0);
const fun_percentage_computed = computed(() => {
  return fun_percentage.value.toFixed(2) + "%";
});
const neutral_percentage = ref(0);
const not_fun_percentage = ref(0);
const percentage_card_computed = computed(() => {
  return `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <b>de plaisir à jouer !</b><br><h2>Neutre:</h2> ${neutral_percentage.value}% <br><h2>Nul:</h2> ${not_fun_percentage.value}%
          </div>`;
});

function calculateFunPercentage() {
  let cpt_fun = 0;
  let cpt_neutral = 0;
  let cpt_not_fun = 0;
  sessions.value.forEach((element) => {
    if (element.was_cool === undefined) cpt_neutral++;
    else if (element.was_cool) cpt_fun++;
    else cpt_not_fun++;
  });
  neutral_percentage.value = (
    (cpt_neutral / sessions.value.length) *
    100
  ).toFixed(0);
  not_fun_percentage.value = (
    (cpt_not_fun / sessions.value.length) *
    100
  ).toFixed(0);
  return (cpt_fun / sessions.value.length) * 100;
}
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

.dv-dashboard {
  display: grid;
  column-gap: 10px;
  row-gap: 10px;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 100px;
  margin-top: 15px;
  padding: 15px;
}

.dv-lc-sessions {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 4;
}

.dv-lc-time-played {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 4;
  grid-column-end: 7;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dv-lc-game-number {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 4;
  grid-row-end: 5;
}

.dv-lc-most-session {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 4;
  grid-column-end: 7;
  grid-row-start: 3;
  grid-row-end: 5;
}

.dv-lc-percentage {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 5;
  grid-row-end: 9;
}

.dv-pie-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 1;
  grid-row-end: 5;
}

.dv-bar-all-game {
  width: 100%;
  height: 100%;
  grid-column-start: 4;
  grid-column-end: 13;
  grid-row-start: 5;
  grid-row-end: 9;
}

.dv-play-time-home {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 7;
  grid-row-start: 9;
  grid-row-end: 13;
}

.dv-fun-percentage {
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 9;
  grid-row-end: 13;
}
</style>
