<template>
  <div class="container">
    <Image :src="logo" width="250" class="header" />
    <PlayTimeHome class="play-time"></PlayTimeHome>
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
import PlayTimeHome from "../components/PlayTimeHome.vue";
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.play-time {
  margin-top: 50px;
}
</style>
