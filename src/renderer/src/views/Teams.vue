<template>
  <div class="container">
    <h2>Choisissez votre équipe !</h2>
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
  justify-content: center;
  height: 100%;
}
</style>
