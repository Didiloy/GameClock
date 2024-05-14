<script setup>
import Sidebar from "./components/Sidebar.vue";
import { useRouter } from "vue-router";
import { initialiseFirebase } from "./database/firebaseConfig";
const router = useRouter();
const storeDatabases = useStoredDatabases();
const { stored_databases, loadDatabases, selected_database_index } =
  storeToRefs(storeDatabases);
console.log(stored_databases.value);
if (stored_databases.value.length === 0) {
  console.log("No databases");
  router.push("/adddatabase");
} else {
  initialiseFirebase(stored_databases, selected_database_index);
}
import { useStore, useStoredDatabases } from "./store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { sessions, games, teams } = storeToRefs(store);
</script>

<template>
  <div class="app-container main-background">
    <div class="sidebar">
      <Sidebar></Sidebar>
    </div>
    <div
      v-if="
        (sessions.length === 0 || games.length === 0 || teams.length === 0) &&
        stored_databases.length > 0
      "
      class="content"
    >
      <div class="a-loading">
        <h2>Chargement des données</h2>
        <ProgressSpinner />
      </div>
    </div>
    <div v-else class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: grid;
  grid-template-columns: 185px auto;
  height: 100%;
  width: 100%;
}

:global(.main-background) {
  background-color: var(--primary-50);
}
.a-loading {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  height: 50vh;
  width: 100%;
}

h2 {
  color: #5a5d9d;
  font-size: 2rem;
}

.content {
  padding: 5px;
  height: 100%;
  width: 100%;
}
</style>
