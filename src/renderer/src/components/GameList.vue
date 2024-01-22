<template>
  <DataTable :value="all_games" stripedRows tableStyle="min-width: 50rem">
    <Column field="name" header="Nom du jeu"></Column>
    <Column field="playtime" header="Temps de jeu">
      <template #body="slotProps">
        {{ convertMinuteToHoursMinute(slotProps.data.playtime) }}</template
      >
    </Column>
    <Column header="Pourcentage">
      <template #body="slotProps">
        {{ calculatePercentage(slotProps.data.playtime) }}%
      </template></Column
    >
  </DataTable>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { getGames, getSessions } from "../database/database";
import { getDoc } from "firebase/firestore";

onMounted(() => {
  init();
});

const all_games = ref([]);
const games = ref([]);
const total_time = ref(0);
const sessions = ref([]);

async function init() {
  await updateGames();
  await updateSession();
  total_time.value = calculateTotalTime();
  let all_games_playtime = [
    {
      name: "Total",
      playtime: total_time.value,
    },
  ];
  for (const v of games.value) {
    let playtime = await calculateGamePlayTime(v.name);
    all_games_playtime.push({ name: v.name, playtime: playtime });
  }
  all_games.value = all_games_playtime.sort((a, b) => {
    return b.playtime - a.playtime;
  });
}

async function calculateGamePlayTime(game) {
  let playtime = 0;
  for (const s of sessions.value) {
    let gameDetails = (await getDoc(s.game)).data();
    if (gameDetails == undefined) continue;
    if (gameDetails.name == game) {
      playtime += s.duration;
    }
  }
  return playtime;
}

async function updateGames() {
  let t = await getGames();
  games.value = t;
}

async function updateSession() {
  let s = await getSessions();
  sessions.value = s;
}

function calculateTotalTime() {
  let cpt = 0;
  sessions.value.forEach((element) => {
    cpt += element.duration;
  });
  return cpt;
}

function convertMinuteToHoursMinute(minute) {
  return (
    (minute - (minute % 60)) / 60 +
    "h" +
    (minute % 60 == 0 ? "" : (minute % 60) + "min")
  );
}

function calculatePercentage(playtime) {
  return ((playtime / total_time.value) * 100).toFixed(2);
}
</script>
<style scoped></style>
