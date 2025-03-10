<template>
  <div v-if="loading">
    <Loading msg="calculating_statistics" />
  </div>
  <div v-else class="game-details-container" :style="`--bg-url: url('${selected_hero}')`">
    <div class="background-container">

    </div>

    <div class="overlay-container">
      <div class="content-container-left">
        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>

        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>

        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>
      </div>

      <div class="content-container-right">
        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>

        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>

        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>
      </div>
    </div>
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
  console.log(selected_game.value);

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
  filter: blur(10px);
}


.overlay-container {
  --container-size: calc(100% - 186px);
  background-color: rgba(0, 0, 0, 0.3);
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  width: var(--container-size);
  height: calc(100vh - 32px - 6px);
  /* 32px: topbar et 6px bottom */
  margin-top: 32px;
  z-index: 99999;
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.content-container-left {
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.content-container-right {
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.div-img {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  max-width: 100%;
}

.div-img>input {
  margin-top: 6px;
}

.img-heroe {
  max-width: 90%;
  max-height: 200px;
}
</style>
