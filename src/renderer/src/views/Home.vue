<template>
  <div class="h-container">
    <Image :src="logo" class="header" width="250" />
    <div class="h-dash" v-if="teams.length !== 0">
      <Dashboard class="dashboard" teamName=""></Dashboard>
    </div>
    <div v-else>
      <h4>
        Aucune équipe pour le moment.
        <router-link to="/addteam">Ajoutez-en une !</router-link>
      </h4>
    </div>
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
import Dashboard from "../components/Dashboard.vue";
import { getPreferences } from "../preferences/preferences";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { teams } = storeToRefs(store);

function keyEventAddSession(e) {
  if (
    e.key ===
      getPreferences("add_session_from_homepage_key_shortcut").toLowerCase() ||
    e.key ===
      getPreferences("add_session_from_homepage_key_shortcut").toUpperCase()
  ) {
    if (getPreferences("add_session_from_homepage_team_name") !== "")
      router.push(
        "/team/" +
          getPreferences("add_session_from_homepage_team_name") +
          "/" +
          getPreferences("add_session_from_homepage_game_name")
      );
  }
}

onMounted(() => {
  document.addEventListener("keyup", keyEventAddSession);
});
onUnmounted(() => {
  document.removeEventListener("keyup", keyEventAddSession);
});
</script>
<style scoped>
.h-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
}

.h-dash {
  flex: 1;
  width: 100%;
}

.dashboard {
  width: 100%;
}
</style>
