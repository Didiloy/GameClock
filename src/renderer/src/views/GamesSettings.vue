<template>
  <div class="gs-container">
    <h2 class="gs-title">{{ $t("GamesSettings.title") }}</h2>
    <div class="gs-search">
      <SelectButton
        v-model="sort_value"
        :options="options"
        optionLabel="name"
        :pt="{
          root: { style: 'margin-top: 0px;' },
          button: { style: 'height: 30px;' },
        }"
      />
    </div>
    <i>{{ games_values_searched.length + " " + $t("GamesSettings.games") }} </i>
    <div v-if="!loaded">
      <Loading msg="calculating_games_statistics" />
    </div>
    <div v-else class="gs-games">
      <DataView :value="games_values_searched" class="dataview">
        <template #list="slotProps">
          <div
            v-for="(item, index) in slotProps.items"
            :key="item.id"
            :class="getClassNameFromIndex(index)"
            :style="
              item.gradient_color &&
              'background: linear-gradient(to left, ' +
                item.gradient_color +
                ', var(--primary-100) 70%);'
            "
            @click="onClickHandler(item.id, index)"
          >
            <div class="team-name">
              <img
                :src="item.logo"
                style="max-width: 60px; max-height: 60px; margin-right: 10px"
              />
              <h3>{{ item.name }}</h3>
            </div>
            <div class="team-playtime">
              <h4>
                {{
                  item.sessionCount +
                  " " +
                  i18n.t("GamesSettings.sessions_count")
                }}
                -
                {{ convertMinuteToHoursMinute(item.duration) }}
              </h4>
            </div>
            <div class="icon-action">
              <i class="pi pi-arrow-right"></i>
            </div>
          </div>
        </template>
      </DataView>
    </div>
  </div>
</template>
<script setup>
import Loading from "../components/Loading.vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useSearchStore } from "../store/store";
import { convertMinuteToHoursMinute } from "../common/main";
import { getPreferences } from "../preferences/preferences";

const searchStore = useSearchStore();

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const emit = defineEmits(["toggleChronoListener"]);

const store = useStore();
const { games, sessions } = storeToRefs(store);
const games_values = ref([]);
const games_values_searched = ref([]);

const loaded = ref(false);

const sort_value = ref({
  name: i18n.t("GamesSettings.alphabetical_order"),
  value: 0,
});
const options = ref([
  { name: i18n.t("GamesSettings.alphabetical_order"), value: 0 },
  { name: i18n.t("GamesSettings.sessions_number"), value: 1 },
  { name: i18n.t("GamesSettings.game_time"), value: 2 },
]);

onMounted(() => {
  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    id: item.id,
    game: { id: item.game.id },
  }));

  const _games = games.value.map((item) => ({
    id: item.id,
    name: item.name,
    heroe: item.heroe,
    logo: item.logo,
    grid: item.grid,
  }));

  window.electron.ipcRenderer.send("gamesessionscount", {
    sessions: _sessions,
    games: _games,
  });
});

window.electron.ipcRenderer.on("result_gamesessionscount", (event, data) => {
  games_values.value = data.games_values;
  games_values_searched.value = games_values.value;
  if (getPreferences("use_logo_color_in_team_list")) {
    setTimeout(() => getTeamColorWithWorker(), 0);
  }
  loaded.value = true;
});

watch(
  () => searchStore.searchValue,
  () => {
    if (searchStore.searchValue.length < 3 && searchStore.searchValue !== "") {
      return;
    }
    loaded.value = false;
    if (searchStore.searchValue === "") {
      games_values_searched.value = games_values.value;
      sortGames();
      loaded.value = true;
      return;
    }
    games_values_searched.value = games_values.value.filter((g) =>
      g.name.toLowerCase().includes(searchStore.searchValue.toLowerCase()),
    );
    sortGames();
    loaded.value = true;
  },
);

watch(sort_value, () => {
  sortGames();
});

function sortGames() {
  games_values_searched.value.sort((a, b) => {
    if (sort_value.value.value === 1) {
      return b.sessionCount - a.sessionCount;
    } else if (sort_value.value.value === 2) {
      return b.duration - a.duration;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
}

function getClassNameFromIndex(index) {
  if (index === 0) {
    return "team-item rounded-top";
  } else if (index === games_values_searched.value.length - 1) {
    return "team-item rounded-bottom";
  } else {
    return "team-item";
  }
}

import { useRouter } from "vue-router";
const router = useRouter();
function onClickHandler(game_id, index) {
  router.push({ name: "settings-games-details", params: { id: game_id } });
}

function getTeamColorWithWorker() {
  let id = 0;
  for (let team of games_values_searched.value) {
    const worker = new Worker(
      new URL("../workers/colorWorker.js", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event) => {
      const { logo, color, error } = event.data;

      if (error) {
        console.error(`Error processing logo ${logo}: ${error}`);
        worker.terminate();
        return;
      }

      team.gradient_color = color;
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error(`Worker error: ${error.message}`);
      worker.terminate();
    };

    worker.postMessage({ logo: team.logo, id: id });
    id++;
  }
}
</script>
<style scoped>
.gs-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

.gs-title {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}

.gs-games {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 80%;
  margin-bottom: 50px;
}

.gs-m {
  margin-top: 10px;
}

.gs-search {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dataview {
  width: max(750px, 90%);
  background-color: var(--primary-100);
}

.team-item {
  width: 100%;
  height: 75px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--primary-100);
  padding-left: 10px;
  padding-right: 10px;
}

.success {
  max-width: 25px;
  max-height: 25px;
  width: 25px;
  height: 25px;
  margin-left: 10px;
}

.team-item:hover {
  cursor: pointer;
  font-size: 15pt;
  color: black;
}

.rounded-top {
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.rounded-bottom {
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.team-name {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
}

h4 {
  width: max-content;
}

.icon-action {
  width: 50px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
