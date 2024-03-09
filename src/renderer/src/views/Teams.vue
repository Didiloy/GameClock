<template>
  <div class="container">
    <h2 class="t-title">Choisissez votre équipe !</h2>
    <TeamList></TeamList>
  </div>
</template>

<script setup>
import TeamList from "../components/TeamList.vue";
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100%;
  margin-bottom: 20px;
}

@font-face {
  font-family: dishcek;
  src: url('../assets/fonts/dishcek/Dishcek.otf');
}

.t-title{
  color: #5a5d9d;
  font-family: dishcek,serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>
