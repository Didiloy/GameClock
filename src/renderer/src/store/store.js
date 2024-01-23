// stores/counter.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useStore = defineStore("store", () => {
  const teams = ref([]);
  const games = ref([]);
  const sessions = ref([]);
  return { teams, games, sessions };
});
