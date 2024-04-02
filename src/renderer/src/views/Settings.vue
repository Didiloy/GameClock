<script setup>
import TeamsPreferences from "../components/preferences/TeamsPreferences.vue";
</script>

<template>
  <div class="container">
    <h2 class="s-title">Paramètres</h2>
    <TeamsPreferences/>
    <Divider/>
  </div>
</template>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100%;
  width: 100%;
  margin-bottom: 20px;
}

@font-face {
  font-family: dishcek;
  src: url('../assets/fonts/dishcek/Dishcek.otf');
}

.s-title {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>