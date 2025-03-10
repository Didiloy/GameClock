<template>
  <div v-if="loading">
    <Loading msg="calculating_statistics" />
  </div>
  <div
    v-else
    class="game-details-container"
    :style="`--bg-url: url('${selected_hero}')`"
  >
    <div class="background-container">
   
    </div>
    <div class="content-container-left"></div>
    <div class="content-container-right"></div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import Loading from "../components/Loading.vue";
import { useI18n } from "vue-i18n";
const i18n = useI18n();
const store = useStore();
const { teams, sessions, games } = storeToRefs(store);
const loading = ref(true);
const props = defineProps(["id"]);
const selected_game = ref(null);
const selected_hero = computed(() => {
  return selected_game.value?.heroe || null;
});

onMounted(() => {
  selected_game.value = getGameById(props.id);
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

function getGameById(id) {
  return games.value.find((game) => game.id === id);
}
</script>
<style scoped>
.game-details-container {
  width: 100%;
  height: 100%;
}

.background-container {
  /* Set the container to fill its parent */
  width: 100%;
  height: 100%;
  /* Add the background image */
  background-image: var(--bg-url);
  background-size: cover;
  background-position: center;
  /* Position relative so child components can be positioned absolutely if needed */
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  filter: blur(10px);
}

.content-container-left {
  background-color: red;
  width: 40%;
  height: 100%;
  margin: 20px;
  z-index: 99999;
  position: absolute;
  top: 0;
}

.content-container-right {
  background-color: blue;
  width: 40%;
  height: 100%;
  margin: 20px;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
