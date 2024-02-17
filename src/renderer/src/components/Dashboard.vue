<template>
  <div class="dv-dashboard">
    <div class="dv-left">
      <PlayTimeHome class="dv-bar-chart"></PlayTimeHome>
      <BarChartAllGames class="dv-radar-chart"></BarChartAllGames>
      <GamesFunPercentage
          class="dv-radar-chart"></GamesFunPercentage>
    </div>
    <div class="dv-right">
      <div class="dv-right-row">
        <GameTimeHome class="dv-pie-chart"></GameTimeHome>
      </div>
      <div class="dv-right-row mt-5">
        <LittleCard class="mt-5 mr-5"
                    iconName="pi pi-hourglass"
                    :name="team_with_greatest_session_average_playtime"
                    :value="'Fait les plus grosses sessions de jeu (' + convertMinuteToHoursMinute(team_with_greatest_session_average_playtime_value) + ' en moyenne)'"></LittleCard>
        <LittleCard class="mt-5"
                    iconName="pi pi-hourglass"
                    :name="team_with_most_sessions"
                    :value="'A le plus de sessions avec ' + team_with_most_sessions_value + ' sessions'"></LittleCard>
      </div>
      <div class="dv-right-row">
        <div class="littles-card">
          <LittleCard
              class="mr-5"
              iconName="pi pi-hourglass"
              :name="total_time_hours"
              value="passées à jouer"
          ></LittleCard>
          <LittleCard
              class="mr-5"
              iconName="pi pi-sort-amount-up"
              :name="number_of_games"
              value="jeux joués"
          ></LittleCard>
          <LittleCard
              iconName="pi pi-heart-fill"
              :name="fun_percentage_computed"
              :value="percentage_card_computed"
          ></LittleCard>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import PlayTimeHome from "../components/PlayTimeHome.vue";
import GameTimeHome from "../components/GameTimeHome.vue";
import LittleCard from "./LittleCard.vue";
import BarChartAllGames from "../components/BarChartAllGames.vue";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {computed, onMounted, ref, watch} from "vue";
import GamesFunPercentage from "./GamesFunPercentage.vue";

const props = defineProps(["teamName"]);

const store = useStore();
const {sessions, games, teams} = storeToRefs(store);

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
    if (teams_playtime_on_average[i] > team_with_greatest_session_average_playtime_value.value) {
      team_with_greatest_session_average_playtime_value.value = teams_playtime_on_average[i];
      team_with_greatest_session_average_playtime.value = teams_tmp[i];
    }
    if(teams_sessions[i] > team_with_most_sessions_value.value) {
      team_with_most_sessions_value.value = teams_sessions[i];
      team_with_most_sessions.value = teams_tmp[i];
    }
  }
}

const total_time = ref(0);
const total_time_hours = computed(() => {
  return convertMinuteToHoursMinute(total_time.value);
});

function convertMinuteToHoursMinute(minute) {
  return (
      (minute - (minute % 60)) / 60 + "h" + (minute % 60 == 0 ? "" : minute % 60)
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
  return `<b>de plaisir à jouer.</b><br>Neutre: ${neutral_percentage.value}% <br>Nul: ${not_fun_percentage.value}%`;
});

function calculateFunPercentage() {
  let cpt_fun = 0;
  let cpt_neutral = 0;
  let cpt_not_fun = 0;
  sessions.value.forEach((element) => {
    if (element.was_cool == undefined) cpt_neutral++;
    else if (element.was_cool) cpt_fun++;
    else cpt_not_fun++;
  });
  neutral_percentage.value = ((cpt_neutral / sessions.value.length) * 100).toFixed(0);
  not_fun_percentage.value = ((cpt_not_fun / sessions.value.length) * 100).toFixed(0);
  return (cpt_fun / sessions.value.length) * 100;
}
</script>
<style scoped>
.dv-dashboard {
  display: flex;
  flex-direction: row;
  justify-content: start;
  width: 100%;
  height: 100%;
  margin-top: 20px;
}

.dv-left {
  width: 60%;
  margin-right: 5px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

.dv-right {
  width: 48%;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto auto;
}

.dv-right-row {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.dv-bar-chart {
  width: 100%;
  max-height: 300px;
}

.dv-radar-chart {
  width: 100%;
  margin-top: 5px;
  max-height: 300px;
}

.dv-pie-chart {
  width: 100%;
  height: 100%;
}

.littles-card {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-top: 5px;
}

.mr-5 {
  margin-right: 5px;
}

.mt-5 {
  margin-top: 5px;
}
</style>
