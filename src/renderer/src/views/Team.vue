<template>
  <div class="t-container">
    <div class="t-top-row">
      <Button label="Nouvelle session" icon="pi pi-plus" @click="add_session_dialog_visible = !add_session_dialog_visible"></Button>
      <div class="t-title">
        <h2 class="team-name">{{ $route.params.name }}</h2>
      </div>
    </div>
    <Dialog v-model:visible="add_session_dialog_visible" modal dismissableMask header="Ajouter une session" :style="{ width: '600px' }">
      <AddSession :teamName="$route.params.name"></AddSession>
    </Dialog>
    <DashboardTeam :teamName="$route.params.name"></DashboardTeam>
  </div>
</template>

<script setup>
import AddSession from "../components/AddSession.vue";
import DashboardTeam from "../components/DashboardTeam.vue";
import {ref} from "vue";
const add_session_dialog_visible = ref(false);
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

.team-name{
  color: #5a5d9d;
  font-family: dishcek,serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>
