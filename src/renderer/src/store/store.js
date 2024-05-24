// stores/counter.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { getTeams, getGames, getSessions } from "../database/database.js";
import {
  getStoredDatabases,
  deleteDatabase,
} from "../database/stored_databases.js";

export const useStore = defineStore("store", () => {
  const teams = ref([]);
  const games = ref([]);
  const sessions = ref([]);
  const loaded = ref(false);

  reloadStore();

  async function reloadStore() {
    loaded.value = false;
    teams.value = [];
    games.value = [];
    sessions.value = [];

    if (getStoredDatabases().length === 0) return;

    teams.value = await getTeams();
    games.value = await getGames();
    sessions.value = await getSessions();
    loaded.value = true;
  }

  return { teams, games, sessions, reloadStore, loaded };
});

export const useStoredDatabases = defineStore("storedDatabases", () => {
  const stored_databases = ref([]);

  loadDatabases();

  function loadDatabases() {
    stored_databases.value = [];
    stored_databases.value = getStoredDatabases();
  }

  function useDeleteDatabase(name, apiKey, authDomain) {
    deleteDatabase(name, apiKey, authDomain);
    loadDatabases();
  }

  return {
    stored_databases,
    loadDatabases,
    useDeleteDatabase,
  };
});

export const useStoreChrono = defineStore("storeChrono", () => {
  const chrono_value = ref(0);

  function updateChrono(value) {
    chrono_value.value = value;
  }

  return {
    chrono_value,
    updateChrono,
  };
});
