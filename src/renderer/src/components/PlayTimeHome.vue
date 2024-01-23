<template>
  <div class="container">
    <Card class="card">
      <template #title> Top 3 des équipes par temps de jeu </template>
      <template #content>
        <DataTable
          :value="teams_playtime"
          stripedRows
          tableStyle="min-width: 50rem"
        >
          <Column field="name" header="Nom de l'équipe"></Column>
          <Column field="playtime" header="Temps de jeu">
            <template #body="slotProps">
              {{
                convertMinuteToHoursMinute(slotProps.data.playtime)
              }}</template
            >
          </Column>
          <Column header="Pourcentage">
            <template #body="slotProps">
              {{ calculatePercentage(slotProps.data.playtime) }}%
            </template></Column
          >
        </DataTable>
      </template>
    </Card>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { getDoc } from "firebase/firestore";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";

onMounted(() => {
  init();
  // console.log(sessions);
  // console.log(teams);
  // setTimeout(() => {
  //   console.log(sessions);
  //   console.log(teams);
  // }, 1000);
});

const store = useStore();
const { sessions, teams } = storeToRefs(store);
const total_time = ref(0);
const teams_playtime = ref([]);

async function init() {
  total_time.value = calculateTotalTime();
  let all_teams_playtime = [
    {
      name: "Total",
      playtime: total_time.value,
    },
  ];
  for (const v of teams.value) {
    let playtime = await calculateTeamPlayTime(v.name);
    all_teams_playtime.push({ name: v.name, playtime: playtime });
  }
  teams_playtime.value = all_teams_playtime
    .sort((a, b) => {
      return b.playtime - a.playtime;
    })
    .slice(0, 4);
}

async function calculateTeamPlayTime(teamName) {
  let playtime = 0;
  for (const s of sessions.value) {
    let teamDetails = (await getDoc(s.team)).data();
    if (teamDetails == undefined) continue;
    if (teamDetails.name == teamName) {
      playtime += s.duration;
    }
  }
  return playtime;
}

function calculateTotalTime() {
  let cpt = 0;
  sessions.value.forEach((element) => {
    cpt += element.duration;
  });
  return cpt;
}

function calculatePercentage(playtime) {
  return ((playtime / total_time.value) * 100).toFixed(2);
}

function convertMinuteToHoursMinute(minute) {
  return (
    (minute - (minute % 60)) / 60 +
    "h" +
    (minute % 60 == 0 ? "" : (minute % 60) + "min")
  );
}
</script>
<style scoped>
.card {
  background-color: var(--primary-100);
  width: 70vw;
}
</style>
