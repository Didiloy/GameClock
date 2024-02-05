<template>
  <div class="dv-dashboard">
    <div class="dv-left">
      <PlayTimeHome class="dv-bar-chart"></PlayTimeHome>
      <BarChartAllGames class="dv-radar-chart"></BarChartAllGames>
    </div>
    <div class="dv-right">
      <GameTimeHome class="dv-pie-chart"></GameTimeHome>
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
          value="de plaisir à jouer"
        ></LittleCard>
      </div>
    </div>
  </div>
</template>
<script setup>
import PlayTimeHome from "../components/PlayTimeHome.vue";
import GameTimeHome from "../components/GameTimeHome.vue";
import LittleCard from "./LittleCard.vue";
import BarChartAllGames from "../components/BarChartAllGames.vue";
const props = defineProps(["teamName"]);

import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { sessions, games } = storeToRefs(store);

import { computed, ref, onMounted, watch } from "vue";

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
function calculateFunPercentage() {
  let cpt = 0;
  sessions.value.forEach((element) => {
    if (element.was_cool) cpt++;
  });
  return (cpt / sessions.value.length) * 100;
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
  display: flex;
  flex-direction: column;
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
</style>
