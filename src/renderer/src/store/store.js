// stores/counter.js
import { defineStore } from "pinia";
import { ref } from "vue";
import {getTeams, getGames, getSessions, getPlatforms} from "../database/database.js";
import {
  getStoredDatabases,
  deleteDatabase,
} from "../database/stored_databases.js";
import { useStorage } from '@vueuse/core'


export const useStore = defineStore("store", () => {
  const teams = ref([]);
  const games = ref([]);
  const sessions = ref([]);
  const platforms = ref([]);
  const loaded = ref(false);
  const first_load = ref(true);

  const store_error = ref("");
  reloadStore();

  async function reloadStore() {
    loaded.value = false;
    teams.value = [];
    games.value = [];
    sessions.value = [];
    platforms.value = [];
    store_error.value = "";

    if (getStoredDatabases().length === 0) {
      store_error.value = ""; //do not set error so that in app.vue we can push a page to the router
      loaded.value = true;
      return;
    }

    try {
      teams.value = await getTeams();
      games.value = await getGames();
      sessions.value = await getSessions();
      platforms.value = await getPlatforms();
    } catch (e) {
      store_error.value = e.message;
      loaded.value = true;
      return;
    }

    first_load.value = false;
    loaded.value = true;
  }

  return {
    teams,
    games,
    sessions,
    platforms,
    reloadStore,
    loaded,
    first_load,
    store_error,
  };
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

export const useStoreWaitingList = defineStore("storeWaitingList", () => {
  const waiting_list = useStorage('waiting_list', []);

  function addSession(session_object) {
    waiting_list.value.push(session_object);
  }

  function deleteSession(session_object) {
    waiting_list.value = waiting_list.value.filter(s => s !== session_object);
  }

  function cleanSession() {
    waiting_list.value = [];
  }

  return {
    waiting_list,
    addSession,
    cleanSession,
    deleteSession
  };
});
