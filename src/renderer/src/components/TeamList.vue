<template>
  <Card>
    <template #content>
      <DataTable :value="teams" stripedRows tableStyle="min-width: 50rem">
        <Column field="name" header="Nom"></Column>
        <Column header="Temps de jeu">
          <template #body>
            <span>{{ playtime }}</span>
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
import { getDoc } from "firebase/firestore/lite";
const teams = ref([]);
const sessions = ref([]);
const playtime = ref(0);

const updateTeams = async () => {
  let t = await getTeams();
  teams.value = t;
};

const updateSession = async () => {
  let s = await getSessions();
  sessions.value = s;
};

const calculateTeamPlayTime = async (teamName) => {
  // let playtime = 0;
  sessions.value.forEach(async (s) => {
    let teamDetails = (await getDoc(s.team)).data();
    console.log(teamDetails.name == teamName);
    if (teamDetails.name == teamName) {
      playtime.value += s.duration;
    }
  });
};

const init = async () => {
  await updateTeams();
  await updateSession();
  teams.value.forEach((t) => {
    calculateTeamPlayTime(t.name);
  });
};

onMounted(() => {
  init();
});
</script>
