<template>
  <Card>
    <template #content>
      <DataTable :value="teams" stripedRows tableStyle="min-width: 50rem">
        <Column field="name" header="Nom"></Column>
      </DataTable>
    </template>
  </Card>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { firebase, db } from "../main.js";
import { getDocs, collection } from "firebase/firestore/lite";

const teams = ref([]);

const getTeams = async (db) => {
  const t = collection(db, "teams");
  const teamSnapshot = await getDocs(t);
  const teamsList = teamSnapshot.docs.map((doc) => doc.data());
  teams.value = teamsList;
};

onMounted(() => {
  getTeams(db);
});
</script>
