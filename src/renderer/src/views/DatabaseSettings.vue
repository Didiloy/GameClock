<script setup>
import AddDatabasePreference from "../components/preferences/AddDatabasePreference.vue";
</script>

<template>
  <div class="s-container">
    <AddDatabasePreference />
  </div>
</template>

<style scoped>
.s-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 95%;
  margin: 10px;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}
</style>
