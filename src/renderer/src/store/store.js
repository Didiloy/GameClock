// stores/counter.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { getTeams, getGames, getSessions } from "../database/database.js";

export const useStore = defineStore("store",  () => {
  const teams = ref([]);
  const games = ref([]);
  const sessions = ref([]);

  reloadStore();

  async function reloadStore() {
    teams.value = [];
    games.value = [];
    sessions.value = [];
    teams.value = await getTeams();
    games.value = await getGames();
    sessions.value = await getSessions();
  }

  return { teams, games, sessions, reloadStore };
});
