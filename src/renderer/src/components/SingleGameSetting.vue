<template>
  <div class="sgs-container">
    <Card class="card" :pt="{ root: { style: 'box-shadow: 0px 0px 0px 0px;' },
     body: {style: 'height: 100%;'},
     content: {style: 'height: 100%;'}}">
      <template #title
      ><span class="sgs-title">{{ props.name }}</span></template
      >
      <template #content>
        <div class="sessions-info">
          <p class="individual-info"><span class="individual-info-lg">{{ total_sessions }} </span> sessions</p>
          <p class="individual-info">Session la plus longue : <span
              class="individual-info-lg">{{ convertMinuteToHoursMinute(longuest_session) }}</span></p>
          <p class="individual-info">Session la plus courte : <span
              class="individual-info-lg">{{ convertMinuteToHoursMinute(smallest_session) }} </span></p>
          <p class="individual-info">Durée moyenne des sessions : <span
              class="individual-info-lg">{{ convertMinuteToHoursMinute(average_session) }}</span></p>
          <p class="individual-info">Équipe qui joue le plus : <span
              class="individual-info-lg">{{ team_who_play_the_most }}</span></p>
        </div>
        <div class="sgs-content">
          <div class="sgs-left">
            <label for="logo">Logo du jeu</label>
            <InputText id="logo" type="text" v-model="logo" style="width:400px;"/>
            <label for="heroe">Image du jeu</label>
            <InputText id="heroe" type="text" v-model="heroe" style="width:400px;"/>
            <Button
                label="Modifier"
                :icon="icon"
                class="btn-add"
                @click="useModifyGame"
                :loading="loading"
                style="margin-top: 10px;"
            ></Button>
          </div>
        </div>
      </template>
    </Card>
    <Toast/>
  </div>
</template>
<script setup>
import {computed, onMounted, ref} from "vue";
import {modifyGame} from "../database/database";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {useToast} from "primevue/usetoast";
import {convertMinuteToHoursMinute} from "../common/main";

const props = defineProps(["name", "logo", "heroe"]);
const name = ref(props.name);
const logo = ref(props.logo);
const heroe = ref(props.heroe);
const heroe_url = computed(() => {
  return "url(" + props.heroe + ")";
});

const store = useStore();
const {games, sessions, teams} = storeToRefs(store);
const icon = ref("pi pi-cloud-upload");
const loading = ref(false);
const toast = useToast();

const game_id = ref("");

function getGameId() {
  return games.value.find((g) => g.name === name.value).id;
}

const total_sessions = ref(0);
const longuest_session = ref(0);
const smallest_session = ref(0);
const average_session = ref(0);

function getTotalSessions() {
  return sessions.value.filter((s) => s.game.id === game_id.value).length;
}

function getLonguestSession() {
  return sessions.value
      .filter((s) => s.game.id === game_id.value)
      .reduce((acc, s) => (s.duration > acc ? s.duration : acc), 0);
}

function getSmallestSession() {
  return sessions.value
      .filter((s) => s.game.id === game_id.value)
      .reduce((acc, s) => (s.duration < acc ? s.duration : acc), longuest_session.value);
}

function getAverageSession() {
  return (sessions.value
      .filter((s) => s.game.id === game_id.value)
      .reduce((acc, s) => acc + s.duration, 0) / total_sessions.value).toFixed(0);
}

const team_who_play_the_most = ref("");

function getTeamWhoPlayTheMost() {
  const team_id = sessions.value
      .filter((s) => s.game.id === game_id.value)
      .map((s) => s.team.id)
      .reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});
  const team_id_max = Object.keys(team_id).reduce((a, b) => (team_id[a] > team_id[b] ? a : b));
  return teams.value.find((t) => t.id === team_id_max).name;
}

onMounted(() => {
  game_id.value = getGameId();
  total_sessions.value = getTotalSessions();
  longuest_session.value = getLonguestSession();
  smallest_session.value = getSmallestSession();
  average_session.value = getAverageSession();
  team_who_play_the_most.value = getTeamWhoPlayTheMost();
});

async function useModifyGame() {
  loading.value = true;
  const success = await modifyGame(name.value, logo.value, heroe.value);
  loading.value = false;
  if (success) {
    icon.value = "pi pi-check";
    toast.add({
      severity: "success",
      summary: "",
      detail: "C'est tout bon !",
      life: 3000,
    });
    await store.reloadStore();
  } else {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Une erreur est survenue lors de l'ajout de la session de jeu.",
      life: 3000,
    });
  }
}
</script>
<style scoped>

.sgs-container {
  background-image: v-bind(heroe_url);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 500px;
  width: 100%;
  border-radius: 30px;
}

.card {
  width: 100%;
  height: 100%;
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.sgs-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.sgs-text-color {
  color: var(--surface-0);
}

.sessions-info {
  color: var(--surface-0);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: start;
  align-items: center;
}

.individual-info {
  display: inline;
  background-color: var(--primary-200);
  padding: 5px;
  border-radius: 10px;
  color: var(--text-color);
  font-size: large;
  margin-right: 20px;
}

.individual-info-lg {
  font-size: x-large;
  color: var(--text-color);
  font-weight: bold;
}

.sgs-left {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
}

.sgs-title {
  color: var(--surface-0);
  text-shadow: 2px 0 0 #000;
  font-size: 30px;
}

label {
  color: var(--surface-0);
  margin-top: 5px;
  text-shadow: 2px 0 0 #000;
  font-size: 20px;
}
</style>
