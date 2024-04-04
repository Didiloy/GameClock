<template>
  <div class="h-container">
    <Image :src="logo" class="header" width="250"/>
    <div class="h-dash">
      <Dashboard class="dashboard" teamName=""></Dashboard>
    </div>
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
import Dashboard from "../components/Dashboard.vue";
import {getPreferences} from "../preferences/preferences";
import {onMounted, onUnmounted} from "vue";
import {useRouter} from "vue-router";

const router = useRouter();

function keyEventAddSession(e) {
  if (e.key === getPreferences("add_session_from_homepage_key_shortcut").toLowerCase() || e.key === getPreferences("add_session_from_homepage_key_shortcut").toUpperCase()) {
    router.push("/team/" + getPreferences("add_session_from_homepage_team_name") + "/" + getPreferences("add_session_from_homepage_game_name"));
  }
}

onMounted(() => {
  document.addEventListener('keyup', keyEventAddSession)
});
onUnmounted(() => {
  document.removeEventListener('keyup', keyEventAddSession);
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
  height: 100%;
  width: 100%;
}

.dashboard {
  width: 100%;
}
</style>
