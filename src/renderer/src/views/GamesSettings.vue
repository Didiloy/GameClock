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
    <i>{{ games_values.length + " " + $t("GamesSettings.games") }} </i>
    <div v-if="!loaded">
      <Loading msg="calculating_games_statistics" />
    </div>
    <div v-else class="gs-games">
      <SingleGameSetting
        class="gs-m"
        v-for="g in games_values"
        :key="g.id"
        :name="g.name"
        :heroe="g.heroe"
        :logo="g.logo"
        :grid="g.grid"
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
// const value = ref("");
const gameSessionCount = ref({});

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
  setTimeout(() => {
    games_values.value = games.value.toSorted((a, b) =>
      a.name.localeCompare(b.name)
    );
    addSessionCountToGames();
    loaded.value = true;
  }, 500);
});

watch(() => searchStore.searchValue, () => {
  games_values.value = games.value.filter((g) =>
    g.name.toLowerCase().includes(searchStore.searchValue.toLowerCase())
  );
  addSessionCountToGames();
  games_values.value = games_values.value.sort((a, b) => {
    if (sort_value.value.value === 1) {
      return b.sessionCount - a.sessionCount;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
});

watch(sort_value, () => {
  games_values.value = games_values.value.sort((a, b) => {
    if (sort_value.value.value === 1) {
      return b.sessionCount - a.sessionCount;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
});

function addSessionCountToGames() {
  // calculate the number of sessions for each game
  gameSessionCount.value = games.value.reduce((acc, game) => {
    acc[game.id] = { name: game.name, sessionCount: 0 };
    return acc;
  }, {});

  sessions.value.forEach((session) => {
    if (gameSessionCount.value[session.game.id]) {
      gameSessionCount.value[session.game.id].sessionCount += 1;
    }
  });

  for (let gv of games_values.value) {
    gv.sessionCount = gameSessionCount.value[gv.id].sessionCount;
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
</style>
