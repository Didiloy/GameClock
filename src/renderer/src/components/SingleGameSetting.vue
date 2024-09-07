<template>
  <div class="sgs-container">
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        body: { style: 'height: 100%;' },
        content: { style: 'height: 100%; padding:0;' },
      }"
    >
      <template #title
        ><span class="sgs-title">{{ props.name }}</span></template
      >
      <template #content>
        <div class="sessions-info">
          <div class="individual-info sgs-session-number">
            <p class="individual-info-lg">{{ total_sessions }}</p>
            <p>{{ $t("SingleGameSetting.sessions") }}</p>
          </div>
          <div class="individual-info sgs-longest-session">
            <p class="individual-info-lg">
              {{ convertMinuteToHoursMinute(longuest_session) }}
            </p>
            <p>{{ $t("SingleGameSetting.longest_session") }}</p>
          </div>
          <div class="individual-info sgs-smallest-session">
            <p class="individual-info-lg">
              {{ convertMinuteToHoursMinute(smallest_session) }}
            </p>
            <p>{{ $t("SingleGameSetting.shortest_session") }}</p>
          </div>
          <div class="individual-info sgs-average-session">
            <p class="individual-info-lg">
              {{ convertMinuteToHoursMinute(average_session) }}
            </p>
            <p>{{ $t("SingleGameSetting.mean_duration") }}</p>
          </div>
          <div class="individual-info sgs-total-playtime">
            <p class="individual-info-lg">
              {{ convertMinuteToHoursMinute(total_playtime) }}
            </p>
            <p>{{ $t("SingleGameSetting.total_playtime") }}</p>
          </div>
          <div class="individual-info sgs-team">
            <p class="individual-info-lg">{{ team_who_play_the_most }}</p>
            <p>{{ $t("SingleGameSetting.team_who_play_the_most") }}</p>
          </div>
        </div>
        <div class="sgs-content">
          <div class="sgs-left">
            <label for="logo">{{ $t("SingleGameSetting.game_logo") }}</label>
            <InputText
              id="logo"
              type="text"
              v-model="logo"
              style="width: 400px"
              @contextmenu="onRightClickLogo"
            />
            <ContextMenu ref="menu_logo" :model="items" />
            <label for="heroe">{{ $t("SingleGameSetting.game_grid") }}</label>
            <InputText
              id="grid"
              type="text"
              v-model="grid"
              style="width: 400px"
              @contextmenu="onRightClickGrid"
            />
            <ContextMenu ref="menu_grid" :model="items_grid" />
            <label for="heroe">{{ $t("SingleGameSetting.game_heroe") }}</label>
            <InputText
              id="heroe"
              type="text"
              v-model="heroe"
              style="width: 400px"
              @contextmenu="onRightClickHeroe"
            />
            <ContextMenu ref="menu_heroe" :model="items_heroe" />
          </div>
          <Button
            :label="i18n.t('SingleGameSetting.modify')"
            :icon="icon"
            class="btn-add"
            @click="useModifyGame"
            :loading="loading"
            style="margin-top: 10px"
          ></Button>
        </div>
      </template>
    </Card>
    <Toast />
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { modifyGame } from "../database/database";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { useToast } from "primevue/usetoast";
import { convertMinuteToHoursMinute } from "../common/main";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const props = defineProps(["name", "logo", "heroe", "grid"]);
const name = computed(() => {
  return props.name;
});
const logo = ref(props.logo);
const heroe = ref(props.heroe);
const grid = ref(props.grid);
const heroe_url = computed(() => {
  return "url(" + props.heroe + ")";
});

const store = useStore();
const { games, sessions, teams } = storeToRefs(store);
const icon = ref("pi pi-cloud-upload");
const loading = ref(false);
const toast = useToast();

async function paste(input) {
  const text = await navigator.clipboard.readText();
  input.value = text;
}

const menu_logo = ref();
const items = ref([
  {
    label: i18n.t("SingleGameSetting.copy"),
    icon: "pi pi-copy",
    command: () => {
      navigator.clipboard.writeText(logo.value);
    },
  },
  {
    label: i18n.t("SingleGameSetting.paste"),
    icon: "pi pi-clone",
    command: () => {
      paste(logo);
    },
  },
]);

const menu_heroe = ref();
const items_heroe = ref([
  {
    label: i18n.t("SingleGameSetting.copy"),
    icon: "pi pi-copy",
    command: () => {
      navigator.clipboard.writeText(heroe.value);
    },
  },
  {
    label: i18n.t("SingleGameSetting.paste"),
    icon: "pi pi-clone",
    command: () => {
      paste(heroe);
    },
  },
]);

const menu_grid = ref();
const items_grid = ref([
  {
    label: i18n.t("SingleGameSetting.copy"),
    icon: "pi pi-copy",
    command: () => {
      navigator.clipboard.writeText(grid.value);
    },
  },
  {
    label: i18n.t("SingleGameSetting.paste"),
    icon: "pi pi-clone",
    command: () => {
      paste(grid);
    },
  },
]);

const onRightClickLogo = (event) => {
  menu_logo.value.show(event);
};

const onRightClickHeroe = (event) => {
  menu_heroe.value.show(event);
};

const onRightClickGrid = (event) => {
  menu_grid.value.show(event);
};

const game_id = ref("");

function getGameId() {
  return games.value.find((g) => g.name === name.value).id;
}

const total_sessions = ref(0);
const longuest_session = ref(0);
const smallest_session = ref(0);
const average_session = ref(0);
const total_playtime = ref(0);

function getTotalPlaytime() {
  let s = sessions.value.filter((s) => s.game.id === game_id.value);
  if (s.length === 0) return 0;
  return s.reduce((acc, s) => acc + s.duration, 0);
}

function getTotalSessions() {
  return sessions.value.filter((s) => s.game.id === game_id.value).length;
}

function getLonguestSession() {
  let s = sessions.value.filter((s) => s.game.id === game_id.value);
  if (s.length === 0) return 0;
  return s.reduce((acc, s) => (s.duration > acc ? s.duration : acc), 0);
}

function getSmallestSession() {
  let s = sessions.value.filter((s) => s.game.id === game_id.value);
  if (s.length === 0) return 0;
  return s.reduce(
    (acc, s) => (s.duration < acc ? s.duration : acc),
    longuest_session.value
  );
}

function getAverageSession() {
  let s = sessions.value.filter((s) => s.game.id === game_id.value);
  if (s.length === 0) return 0;
  return (
    s.reduce((acc, s) => acc + s.duration, 0) / total_sessions.value
  ).toFixed(0);
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
  if (Object.keys(team_id).length === 0) return ""; //check if the object if empty
  const team_id_max = Object.keys(team_id).reduce((a, b) =>
    team_id[a] > team_id[b] ? a : b
  );
  return teams.value.find((t) => t.id === team_id_max).name;
}

onMounted(() => {
  game_id.value = getGameId();
  total_sessions.value = getTotalSessions();
  longuest_session.value = getLonguestSession();
  smallest_session.value = getSmallestSession();
  average_session.value = getAverageSession();
  team_who_play_the_most.value = getTeamWhoPlayTheMost();
  total_playtime.value = getTotalPlaytime();
});

watch(name, () => {
  game_id.value = getGameId();
  total_sessions.value = getTotalSessions();
  longuest_session.value = getLonguestSession();
  smallest_session.value = getSmallestSession();
  average_session.value = getAverageSession();
  team_who_play_the_most.value = getTeamWhoPlayTheMost();
  total_playtime.value = getTotalPlaytime();
  logo.value = props.logo;
  heroe.value = props.heroe;
  grid.value = props.grid;
});

async function useModifyGame() {
  loading.value = true;
  const success = await modifyGame(
    name.value,
    logo.value,
    heroe.value,
    grid.value
  );
  loading.value = false;
  if (success) {
    icon.value = "pi pi-check";
    toast.add({
      severity: "success",
      summary: "",
      detail: i18n.t("SingleGameSetting.all_good"),
      life: 3000,
    });
    setTimeout(async () => {
      await store.reloadStore();
    }, 3000);
  } else {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("SingleGameSetting.error_when_modifying"),
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
  height: 100%;
  width: 100%;
  border-radius: 30px;
}

.card {
  width: 100%;
  height: 100%;
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
}

.sessions-info {
  display: grid;
  column-gap: 5px;
  row-gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 100px;
  width: 90%;
  margin: 0 auto;
}

.sgs-session-number {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 1;
}

.sgs-longest-session {
  grid-column-start: 3;
  grid-column-end: 5;
  grid-row-start: 1;
  grid-row-end: 1;
}

.sgs-smallest-session {
  grid-column-start: 5;
  grid-column-end: 7;
  grid-row-start: 1;
  grid-row-end: 1;
}

.sgs-average-session {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 2;
}

.sgs-total-playtime {
  grid-column-start: 3;
  grid-column-end: 5;
  grid-row-start: 2;
  grid-row-end: 2;
}

.sgs-team {
  grid-column-start: 5;
  grid-column-end: 7;
  grid-row-start: 2;
  grid-row-end: 2;
}

.individual-info {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  font-size: large;
  height: 100%;
  margin: 0;
  padding: 0;
  color: var(--surface-0);
}

.individual-info > p {
  margin: 0;
}

.individual-info-lg {
  font-size: x-large;
  color: var(--surface-0);
  font-weight: bold;
}

.sgs-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: end;
  width: 90%;
  margin: 10px auto 0;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
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
