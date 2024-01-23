<script setup>
import Sidebar from "./components/Sidebar.vue";
import { getGames, getSessions, getTeams } from "./database/database.js";
import { onMounted } from "vue";
import { useStore } from "./store/store.js";
import { storeToRefs } from "pinia";

onMounted(() => {
  init();
});

const store = useStore();
const { sessions, games, teams } = storeToRefs(store);

async function init() {
  games.value = await getGames();
  sessions.value = await getSessions();
  teams.value = await getTeams();
}
</script>

<template>
  <div class="container main-background">
    <div class="sidebar">
      <Sidebar></Sidebar>
    </div>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
}

.main-background {
  background-color: var(--primary-50);
}

.content {
  margin-left: 200px;
  padding: 20px;
  flex: 1; /* Takes remaining width */
}
</style>
