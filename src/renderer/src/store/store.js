// stores/counter.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { getTeams, getGames, getSessions } from "../database/database.js";
import { getStoredDatabases } from "../database/stored_databases.js";

export const useStore = defineStore("store", () => {
  const teams = ref([]);
  const games = ref([]);
  const sessions = ref([]);

  reloadStore();

  async function reloadStore() {
    teams.value = [];
    games.value = [];
    sessions.value = [];

    if (getStoredDatabases().length === 0) return;

    teams.value = await getTeams();
    games.value = await getGames();
    sessions.value = await getSessions();
  }

  return { teams, games, sessions, reloadStore };
});

export const useStoredDatabases = defineStore("storedDatabases", () => {
  const stored_databases = ref([]);
  const selected_database_index = ref(0);

  loadDatabases();

  function loadDatabases() {
    stored_databases.value = [];
    stored_databases.value = getStoredDatabases();
  }

  return { stored_databases, loadDatabases, selected_database_index };
});
