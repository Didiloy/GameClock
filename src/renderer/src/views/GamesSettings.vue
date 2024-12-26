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
      <SingleGameSetting
        class="gs-m"
        v-for="g in games_values_searched"
        :key="g.id"
        :name="g.name"
        :heroe="g.heroe"
        :logo="g.logo"
        :grid="g.grid"
        @toggleChronoListener="emit('toggleChronoListener')"
      />
    </div>
  </div>
</template>
<script setup>
import SingleGameSetting from "../components/SingleGameSetting.vue";
import Loading from "../components/Loading.vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useSearchStore } from "../store/store";

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
  loaded.value = true;
});

// watch(
//   () => searchStore.searchValue,
//   () => {
//     if (searchStore.searchValue.length < 3 && searchStore.searchValue !== "") {
//       return;
//     }
//     loaded.value = false;
//     setTimeout(() => {
//       if (searchStore.searchValue === "") {
//         games_values_searched.value = games_values.value;
//         sortGames();
//         loaded.value = true;
//         return;
//       }
//       games_values_searched.value = games_values.value.filter((g) =>
//         g.name.toLowerCase().includes(searchStore.searchValue.toLowerCase()),
//       );
//       sortGames();
//       loaded.value = true;
//     }, 500);
//   },
// );

watch(sort_value, () => {
  sortGames();
});

function sortGames() {
  games_values_searched.value.sort((a, b) => {
    if (sort_value.value.value === 1) {
      return b.sessionCount - a.sessionCount;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
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
</style>
