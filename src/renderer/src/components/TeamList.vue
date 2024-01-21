<template>
  <Card>
    <template #content>
      <DataTable :value="teamItem" stripedRows tableStyle="min-width: 50rem">
        <Column field="name" header="Nom"></Column>
        <Column header="Temps de jeu">
          <template #body="slotProps">
            <span>{{
              convertMinuteToHoursMinute(slotProps.data.playtime)
            }}</span>
          </template>
        </Column>
        <Column header="">
          <template #body>
            <Button label="Voir les stats"></Button>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { getTeams, getSessions } from "../database/database";
import { getDoc } from "firebase/firestore";

onMounted(() => {
  init();
});

const teams = ref([]);
const sessions = ref([]);
const teamItem = ref([]);

async function updateTeams() {
  let t = await getTeams();
  teams.value = t;
}

async function updateSession() {
  let s = await getSessions();
  sessions.value = s;
}

const init = async () => {
  await updateTeams();
  await updateSession();
  teams.value.forEach(async (v) => {
    let playtime = await calculateTeamPlayTime(v.name);
    teamItem.value.push({ name: v.name, playtime: playtime });
  });
};

async function calculateTeamPlayTime(teamName) {
  let playtime = 0;
  for (const s of sessions.value) {
    let teamDetails = (await getDoc(s.team)).data();
    if (teamDetails.name == teamName) {
      playtime += s.duration;
    }
  }
  return playtime;
}

function convertMinuteToHoursMinute(minute) {
  return (minute - (minute % 60)) / 60 + "h" + (minute % 60) + "min";
}
</script>
