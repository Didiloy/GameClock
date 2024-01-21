<template>
  <div class="container">
    <h2>{{ $route.params.name }}</h2>
    <AddSession :teamName="$route.params.name"></AddSession>
  </div>
</template>

<script setup>
import AddSession from "../components/AddSession.vue";
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
</style>
