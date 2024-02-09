<template>
  <div class="dt-container">
    <div class="dt-dashboard">
      <div class="dv-left">
        <div class="littles-card">
          <LittleCard
            class="mr-5"
            iconName="pi pi-hourglass"
            :name="team_time_hours"
            :value="
              'passées à jouer. Soit ' +
              percentage_total_time +
              'du temps total de jeu'
            "
          ></LittleCard>
          <LittleCard
            class="mr-5"
            iconName="pi pi-sort-amount-up"
            :name="number_of_games"
            value="jeux joués"
          ></LittleCard>
          <LittleCard
            iconName="pi pi-hashtag"
            :name="ranking_computed"
            value="position de l'équipe dans le classement par temps de jeu"
          ></LittleCard>
        </div>
        <LineChartGameByMonth
          class="dv-chart"
          :teamName="props.teamName"
        ></LineChartGameByMonth>
        <BarChartAllGames
          class="dv-chart"
          :teamName="props.teamName"
        ></BarChartAllGames>
      </div>
      <div class="dv-right">
        <GameTimeHome
          class="dv-pie-chart"
          :teamName="props.teamName"
        ></GameTimeHome>
        <Card class="dt-card">
          <template #subtitle> Top 3 des jeux les plus joués </template>
          <template #content>
            <div class="dt-little-game-card">
              <LittleGameCard
                v-for="i in 3"
                :key="i"
                :gameName="top_games[i - 1] ? top_games[i - 1].name : ''"
                :playtime="top_games[i - 1] ? top_games[i - 1].playtime : ''"
                :joyRate="top_games[i - 1] ? top_games[i - 1].joyRate : ''"
                :heroe="top_games[i - 1] ? top_games[i - 1].heroe : ''"
                :icon="top_games[i - 1] ? top_games[i - 1].icon : ''"
              ></LittleGameCard>
            </div>
          </template>
        </Card>
      </div>
    </div>
    <div class="dt-session-history">
      <SessionsHistory :teamName="props.teamName" />
    </div>
  </div>
</template>
<script setup>
import LineChartGameByMonth from "./LineChartGameByMonth.vue";
import GameTimeHome from "../components/GameTimeHome.vue";
import LittleCard from "./LittleCard.vue";
import LittleGameCard from "./LittleGameCard.vue";
import BarChartAllGames from "../components/BarChartAllGames.vue";
import SessionsHistory from "./SessionsHistory.vue";
import {
  getSumSessionsDuration,
  getNumberOfGamePlayed,
  calculateTeamRankingByDuration,
  getFirstGamesByPlaytime,
} from "../database/database";
const props = defineProps(["teamName"]);

import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { sessions, games, teams } = storeToRefs(store);

import { computed, ref, onMounted, watch } from "vue";

onMounted(() => {
  init();
});

watch(sessions, () => {
  init();
});

const top_games = ref([]);

async function init() {
  total_time.value = calculateTotalTime();
  team_time.value = calculateTeamTime(props.teamName);
  number_of_games.value = await getNumberOfGames(props.teamName);
  ranking.value = await calculateRanking(props.teamName);
  top_games.value = await getFirstGamesByPlaytime(3, props.teamName);
}

const total_time = ref(0);
const team_time = ref(0);
const team_time_hours = computed(() => {
  return convertMinuteToHoursMinute(team_time.value);
});
const percentage_total_time = computed(() => {
  return ((team_time.value / total_time.value) * 100).toFixed(2) + "%";
});

function convertMinuteToHoursMinute(minute) {
  return (
    ((minute - (minute % 60)) / 60 > 0
      ? (minute - (minute % 60)) / 60 + "h"
      : "") +
    (minute % 60 == 0
      ? ""
      : minute % 60 >= 10
        ? minute % 60
        : "0" + (minute % 60))
  );
}

function calculateTotalTime() {
  let cpt = 0;
  sessions.value.forEach((element) => {
    cpt += element.duration;
  });
  return cpt;
}

function calculateTeamTime(name) {
  let id_of_team = "";
  for (let t of teams.value) {
    if (t.name == name) {
      id_of_team = t.id;
    }
  }
  if (id_of_team == "") return 0;
  let cpt = 0;
  sessions.value.forEach((element) => {
    if (element.team.id == id_of_team) {
      cpt += element.duration;
    }
  });
  return cpt;
}

const number_of_games = ref(0);
async function getNumberOfGames(teamName) {
  return await getNumberOfGamePlayed(teamName);
}

const ranking = ref(0);
const ranking_computed = computed(() => {
  return ranking.value;
});

async function calculateRanking(teamName) {
  return await calculateTeamRankingByDuration(teamName);
}

const monthNames = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Jui",
  "Aou",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
</script>
<style scoped>
.dt-dashboard {
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dv-chart {
  width: 100%;
  max-height: 300px;
  margin-top: 5px;
}

.dv-pie-chart {
  width: 100%;
  height: 100%;
}

.littles-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.dt-card {
  margin-top: 5px;
  width: 100%;
  height: 100%;
  background-color: var(--primary-100);
}

.dt-little-game-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.mr-5 {
  margin-right: 5px;
}
</style>
