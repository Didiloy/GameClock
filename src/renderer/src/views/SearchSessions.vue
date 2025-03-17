<template>
  <div class="gs-container">
    <SelectButton
      v-model="filter"
      :options="options"
      optionLabel="name"
      :pt="{
        root: { style: 'margin-top: 10px;' },
        button: { style: 'height: 30px;' },
      }"
    />
    <i>{{
      filtered_sessions.length +
      " " +
      $t("SearchSessions.session_history_title")
    }}</i>
    <div v-if="!loaded">
      <Loading msg="calculating_sessions_statistics" />
    </div>
    <div v-else class="gs-sessions">
      <SessionsHistory
        :title="i18n.t('SearchSessions.session_history_title')"
        :sessions="filtered_sessions"
      />
    </div>
  </div>
</template>

<script setup>
import Loading from "../components/Loading.vue";
import SessionsHistory from "../components/SessionsHistory.vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useSearchSessionsStore } from "../store/store";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const i18n = useI18n();
import { debounce } from "lodash";

const store = useStore();
const { sessions, games, teams } = storeToRefs(store);
const searchSessionStore = useSearchSessionsStore();
const router = useRouter();
const loaded = ref(false);
const filtered_sessions = ref([]);

onMounted(() => {
  filtered_sessions.value = [];
  loaded.value = true;
});

watch(
  () => searchSessionStore.searchSessionsValue,
  debounce(() => {
    if (
      searchSessionStore.searchSessionsValue.length < 3 &&
      searchSessionStore.searchSessionsValue !== ""
    ) {
      return;
    }
    if (searchSessionStore.searchSessionsValue === "") {
      filtered_sessions.value = [];
      loaded.value = true;
      return;
    }

    loaded.value = false;
    switch (filter.value.value) {
      case 0:
        filtered_sessions.value = sessions.value.filter((s) =>
          getGameNameById(s.game.id)
            .toLowerCase()
            .includes(searchSessionStore.searchSessionsValue.toLowerCase()),
        );
        break;
      case 1:
        filtered_sessions.value = sessions.value.filter((s) =>
          s.comment
            .toLowerCase()
            .includes(searchSessionStore.searchSessionsValue.toLowerCase()),
        );
        break;
      case 2:
        filtered_sessions.value = sessions.value.filter((s) =>
          isTeamInSession(s, searchSessionStore.searchSessionsValue),
        );
        break;
    }
    loaded.value = true;
  }, 300),
);

const filter = ref({
  name: i18n.t("SearchSessions.search_filter.comment"),
  value: 1,
});
const options = ref([
  { name: i18n.t("SearchSessions.search_filter.game"), value: 0 },
  { name: i18n.t("SearchSessions.search_filter.comment"), value: 1 },
  { name: i18n.t("SearchSessions.search_filter.team"), value: 2 },
]);

function getGameNameById(id) {
  if (!id) return "";
  return games.value.find((element) => element.id === id)?.name || "";
}

function getTeamNameById(id) {
  if (!id) return "";
  return teams.value.find((element) => element.id === id)?.name || "";
}

function isTeamInSession(session, teamName) {
  const lowerTeamName = teamName.toLowerCase();
  return session.teams.some((teamId) => {
    const sessionTeamName = getTeamNameById(teamId)?.toLowerCase();
    return sessionTeamName?.includes(lowerTeamName);
  });
}
</script>

<style scoped>
.gs-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.gs-title {
  color: #5a5d9d;
  font-size: 2.5rem;
  margin: 0;
}

.gs-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  margin-bottom: 50px;
}

.dataview {
  width: max(750px, 90%);
  background-color: var(--primary-100);
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--primary-100);
}

.session-item:hover {
  cursor: pointer;
  color: black;
}

.session-info {
  display: flex;
  align-items: center;
}

.icon-action {
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
