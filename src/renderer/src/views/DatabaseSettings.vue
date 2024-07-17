<script setup>
import AddDatabasePreference from "../components/preferences/AddDatabasePreference.vue";
</script>

<template>
  <div class="s-container">
    <h2 class="s-title">Bases de données</h2>
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
  margin-bottom: 10px;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

.s-title {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>