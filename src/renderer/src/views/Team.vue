<template>
  <div class="t-container">
    <h2>{{ $route.params.name }}</h2>
    <AddSession :teamName="$route.params.name"></AddSession>
    <DashboardTeam :teamName="$route.params.name"></DashboardTeam>
  </div>
</template>

<script setup>
import AddSession from "../components/AddSession.vue";
import DashboardTeam from "../components/DashboardTeam.vue";
</script>
<style scoped>
.t-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
</style>
