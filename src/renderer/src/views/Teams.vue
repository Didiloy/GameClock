<template>
  <div class="t-container">
    <h2 class="t-title">{{ $t("Teams.title") }}</h2>
    <TeamList></TeamList>
  </div>
</template>

<script setup>
import TeamList from "../components/TeamList.vue";
</script>
<style scoped>
.t-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  margin-bottom: 20px;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

.t-title {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
  margin-bottom: 10px;
}
</style>
