<template>
  <div class="t-container">
    <div class="t-top-row">
      <Button label="Nouvelle session" icon="pi pi-plus" @click="toggleAddSession"></Button>
      <div class="t-title">
        <h2 class="team-name">{{ $route.params.name }}</h2>
      </div>
    </div>
    <Dialog v-model:visible="add_session_dialog_visible" modal dismissableMask header="Ajouter une session"
            :style="{ width: '600px' }">
      <AddSession :teamName="$route.params.name" :gameName="add_session_game_name"></AddSession>
    </Dialog>
    <DashboardTeam :teamName="$route.params.name"></DashboardTeam>
  </div>
</template>

<script setup>
import AddSession from "../components/AddSession.vue";
import DashboardTeam from "../components/DashboardTeam.vue";
import {onMounted, onUnmounted, ref} from "vue";
import { getPreferences} from "../preferences/preferences";

const add_session_game_name = ref("");
const add_session_dialog_visible = ref(false);

function toggleAddSession() {
  add_session_dialog_visible.value = !add_session_dialog_visible.value;
}

function keyEventAddSession(e) {
  if (e.key === getPreferences("add_session_key_shortcut").toLowerCase() || e.key === getPreferences("add_session_key_shortcut").toUpperCase()) {
    if(!add_session_dialog_visible.value){
      add_session_game_name.value = ""
      toggleAddSession()
    }
  }
  if (e.key === getPreferences("add_session_with_name_key_shortcut_1").toLowerCase() || e.key === getPreferences("add_session_with_name_key_shortcut_1").toUpperCase()) {
    if(!add_session_dialog_visible.value){
      add_session_game_name.value = getPreferences("add_session_with_name_game_name_1")
      toggleAddSession()
    }
  }
  if (e.key === getPreferences("add_session_with_name_key_shortcut_2").toLowerCase() || e.key === getPreferences("add_session_with_name_key_shortcut_2").toUpperCase()) {
    if(!add_session_dialog_visible.value){
      add_session_game_name.value = getPreferences("add_session_with_name_game_name_2")
      toggleAddSession()
    }
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
.t-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
}

.t-top-row {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
  width: 100%;
}

.t-title {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

@font-face {
  font-family: dishcek;
  src: url('../assets/fonts/dishcek/Dishcek.otf');
}

.team-name {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>
