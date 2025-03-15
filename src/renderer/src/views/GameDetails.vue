<template>
  <div v-if="loading">
    <Loading msg="calculating_statistics" />
  </div>
  <div
    v-else
    class="game-details-container"
    :style="`--bg-url: url('${selected_hero}')`"
  >
    <div class="background-container"></div>

    <div class="overlay-container">
      <div class="content-container-left">
        <div class="div-img">
          <img :src="logo" class="img-heroe" />
          <label for="logo" class="gd-label">{{
            $t("SingleGameSetting.game_logo")
          }}</label>
          <InputText
            v-if="editMode"
            id="logo"
            type="text"
            v-model="logo"
            style="width: 70%"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
            @contextmenu="onRightClickLogo"
          />
          <ContextMenu ref="menu_logo" :model="items" />
        </div>
        <div class="div-img">
          <img :src="grid" class="img-heroe" />
          <label for="heroe" class="gd-label">{{
            $t("SingleGameSetting.game_grid")
          }}</label>
          <InputText
            v-if="editMode"
            id="heroe"
            type="text"
            v-model="grid"
            style="width: 70%"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
            @contextmenu="onRightClickGrid"
          />
          <ContextMenu ref="menu_heroe" :model="items_heroe" />
        </div>
        <div class="div-img">
          <img :src="heroe" class="img-heroe" />
          <label for="heroe" class="gd-label">{{
            $t("SingleGameSetting.game_heroe")
          }}</label>
          <InputText
            v-if="editMode"
            id="grid"
            type="text"
            v-model="heroe"
            style="width: 70%"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
            @contextmenu="onRightClickHeroe"
          />
          <ContextMenu ref="menu_grid" :model="items_grid" />
        </div>
        <div class="button-container">
          <Button
            v-if="!editMode"
            :label="i18n.t('SingleGameSetting.modify')"
            icon="pi pi-pencil"
            class="btn-edit"
            @click="toggleEditMode"
          ></Button>
          <Button
            v-else
            :label="i18n.t('SingleGameSetting.validate')"
            :icon="icon"
            severity="success"
            @click="useModifyGame"
            :loading="loading_modifying"
          ></Button>
          <Button
            v-if="editMode"
            :label="i18n.t('SingleGameSetting.cancel')"
            icon="pi pi-times"
            outlined
            severity="danger"
            @click="cancelEdit"
          ></Button>
        </div>
      </div>

      <div class="content-container-right">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">{{ $t("SingleGameSetting.sessions") }}</h3>
              <p class="stat-value">{{ total_sessions }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">
                {{ $t("SingleGameSetting.longest_session") }}
              </h3>
              <p class="stat-value">
                {{ convertMinuteToHoursMinute(longuest_session) }}
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">
                {{ $t("SingleGameSetting.shortest_session") }}
              </h3>
              <p class="stat-value">
                {{ convertMinuteToHoursMinute(smallest_session) }}
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">
                {{ $t("SingleGameSetting.mean_duration") }}
              </h3>
              <p class="stat-value">
                {{ convertMinuteToHoursMinute(average_session) }}
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">
                {{ $t("SingleGameSetting.total_playtime") }}
              </h3>
              <p class="stat-value">
                {{ convertMinuteToHoursMinute(total_playtime) }}
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <h3 class="stat-title">
                {{ $t("SingleGameSetting.team_who_play_the_most") }}
              </h3>
              <p class="stat-value">{{ team_who_play_the_most }}</p>
            </div>
          </div>
        </div>
        <div class="button-show-all-sessions">
          <Button @click="show_all_sessions = true">
            {{ $t("SingleGameSetting.show_all_sessions") }}
          </Button>
        </div>
      </div>
    </div>
    <Dialog
      v-model:visible="show_all_sessions"
      modal
      dismissableMask
      :style="{ width: '90%', height: 'fit-content' }"
    >
      <div style="height: 100%; width: 100%">
        <SessionsHistory
          :title="i18n.t('SingleGameSetting.sessions_of', [selected_game.name])"
          :sessions="game_sessions"
        />
      </div>
    </Dialog>
    <Toast />
  </div>
</template>
<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { modifyGame } from "../database/database";
import SessionsHistory from "../components/SessionsHistory.vue";
import Loading from "../components/Loading.vue";
import { useToast } from "primevue/usetoast";
const toast = useToast();
import { useI18n } from "vue-i18n";
import { convertMinuteToHoursMinute } from "../common/main";
const i18n = useI18n();
const store = useStore();
const { teams, sessions, games } = storeToRefs(store);
const loading = ref(true);
const props = defineProps(["id"]);
const emit = defineEmits(["toggleChronoListener"]);
const selected_game = ref(null);
const selected_hero = computed(() => {
  return selected_game.value?.heroe || null;
});

const loading_modifying = ref(false);
const editMode = ref(false);
const icon = ref("pi pi-cloud-upload");

const logo = ref("");
const heroe = ref("");
const grid = ref("");
const originalLogo = ref("");
const originalHeroe = ref("");
const originalGrid = ref("");

const show_all_sessions = ref(false);

const total_sessions = ref(0);
const longuest_session = ref(0);
const smallest_session = ref(0);
const average_session = ref(0);
const total_playtime = ref(0);
const team_who_play_the_most = ref("");

const game_sessions = ref([]);

onMounted(() => {
  selected_game.value = getGameById(props.id);
  logo.value = selected_game.value.logo;
  heroe.value = selected_game.value.heroe;
  grid.value = selected_game.value.grid;
  // Store original values
  originalLogo.value = logo.value;
  originalHeroe.value = heroe.value;
  originalGrid.value = grid.value;

  game_sessions.value = sessions.value.filter(
    (s) => s.game.id === selected_game.value.id,
  );

  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    id: item.id,
    game: { id: item.game.id },
    teams: item.teams.map((t) => t),
  }));

  const _teams = teams.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  window.electron.ipcRenderer.send("singlegamestats", {
    game_id: selected_game.value.id,
    sessions: _sessions,
    teams: _teams,
  });
});

window.electron.ipcRenderer.on("result_singlegamestats", (event, data) => {
  let {
    gameId,
    _total_sessions,
    _longuest_session,
    _smallest_session,
    _average_session,
    _team_who_play_the_most,
    _total_playtime,
  } = data;
  if (gameId === selected_game.value.id) {
    total_sessions.value = _total_sessions;
    longuest_session.value = _longuest_session;
    smallest_session.value = _smallest_session;
    average_session.value = _average_session;
    team_who_play_the_most.value = _team_who_play_the_most;
    total_playtime.value = _total_playtime;
    loading.value = false;
  }
});

function toggleEditMode() {
  // Save original values before editing
  originalLogo.value = logo.value;
  originalHeroe.value = heroe.value;
  originalGrid.value = grid.value;
  editMode.value = true;
}

function cancelEdit() {
  // Restore original values
  logo.value = originalLogo.value;
  heroe.value = originalHeroe.value;
  grid.value = originalGrid.value;
  editMode.value = false;
}

function getGameById(id) {
  return games.value.find((game) => game.id === id);
}

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

async function useModifyGame() {
  loading_modifying.value = true;
  const success = await modifyGame(
    selected_game.value.name,
    logo.value,
    heroe.value,
    grid.value,
  );
  loading_modifying.value = false;
  if (success) {
    icon.value = "pi pi-check";
    toast.add({
      severity: "success",
      summary: "",
      detail: i18n.t("SingleGameSetting.all_good"),
      life: 3000,
    });
    setTimeout(async () => {
      editMode.value = false;
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
.game-details-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.background-container {
  width: 100%;
  height: 100%;
  background-image: var(--bg-url);
  background-size: cover;
  background-position: center;
  filter: blur(10px);
}

.overlay-container {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  width: 100%;
  height: 100%;
  z-index: 99;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.content-container-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50%;
  height: 100%;
}

.content-container-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 50%;
  height: 100%;
  padding: 20px;
}

.div-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  height: 30%;
}

.img-heroe {
  max-width: 90%;
  max-height: 55%;
  border-radius: 10px;
}

.gd-label {
  color: white;
}

.button-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  padding: 10px;
}

.stat-card {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.stat-content {
  flex: 1;
}

.stat-title {
  margin: 0;
  font-size: 1rem;
  color: white;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 5px 0;
  color: white;
}

.stat-description {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.show-all-sessions {
  width: 100%;
}
</style>
