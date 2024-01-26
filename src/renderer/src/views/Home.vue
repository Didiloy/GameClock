<template>
  <div class="container">
    <Image :src="logo" width="250" class="header" />
    <div class="graphs">
      <PlayTimeHome class="play-time"></PlayTimeHome>
      <GameTimeHome class="play-time"></GameTimeHome>
    </div>
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
import PlayTimeHome from "../components/PlayTimeHome.vue";
import GameTimeHome from "../components/GameTimeHome.vue";
import { ref, onMounted } from "vue";

onMounted(() => {});
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.graphs {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 400px;
}

.play-time {
  margin-top: 50px;
  width: 49%;
  height: 100%;
}
</style>
