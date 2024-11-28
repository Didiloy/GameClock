<template>
  <div class="h-container">
    <div class="h-dash" v-if="teams.length !== 0">
      <Dashboard class="dashboard" teamName=""></Dashboard>
    </div>
    <div v-else>
      <h4>
        {{ $t("Home.no_teams") }}
        <router-link to="/addteam">{{ $t("Home.add_team") }}</router-link>
      </h4>
    </div>
    <Dialog
      v-model:visible="add_session_dialog_visible"
      modal
      dismissableMask
      closeOnEscape
      :closable="false"
      :showHeader="false"
      :pt="{
        content: {
          style:
            'height: 600px; width: 800px; border-radius: 15px; margin: 0; padding: 0;',
        },
      }"
    >
      <AddSession
        teamName=""
        :add-to-waiting-list="false"
        @toggleChronoListener="toggleChronoListener"
      ></AddSession>
    </Dialog>
  </div>
</template>

<script setup>
import Dashboard from "../components/Dashboard.vue";
import AddSession from "../components/AddSession.vue";
import { getPreferences } from "../preferences/preferences";
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { teams } = storeToRefs(store);
const add_session_dialog_visible = ref(false);

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
          getPreferences("add_session_from_homepage_game_name"),
      );
  } else if (
    e.key ===
      getPreferences("shortcut_show_add_session_dialog").toLowerCase() ||
    e.key === getPreferences("shortcut_add_session_from_homepage").toUpperCase()
  ) {
    add_session_dialog_visible.value = true;
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
