<template>
  <div class="h-container">
    <span class="h-span">{{ total_time_hours.toUpperCase() }}</span>
    <br/>
    <span class="h-subtitle">{{ $t("Dashboard.spent_playing").toUpperCase()}}</span>
    <div class="h-dash" v-if="teams.length !== 0">
      <Dashboard class="dashboard" teamName=""></Dashboard>
    </div>
    <div v-else>
      <h4>
        {{ $t("Home.no_teams") }}
        <router-link to="/addteam">{{ $t("Home.add_team") }}</router-link>
      </h4>
    </div>
  </div>
</template>

<script setup>
import Dashboard from "../components/Dashboard.vue";
import { getPreferences } from "../preferences/preferences";
import {onMounted, onUnmounted} from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { teams } = storeToRefs(store);

import {useTotalTime} from "../composables/total_time";
const { total_time_hours, calculateTotalTime } = useTotalTime();

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
  calculateTotalTime();
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

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

.h-span {
  font-size: 3rem;
  font-family: dishcek, serif;
  color: #5a5d9d;
  font-weight: bold;
  margin-bottom: -30px;
  padding-bottom: 0px;
}

.h-subtitle {
  font-size: 1.2rem;
  font-family: dishcek, serif;
  color: #5a5d9d;
}
</style>
