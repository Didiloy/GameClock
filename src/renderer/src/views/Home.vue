<template>
  <div class="h-container">
    <Image :src="logo" class="header" width="250"/>
    <div class="h-dash">
      <Dashboard class="dashboard" teamName=""></Dashboard>
    </div>
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
import Dashboard from "../components/Dashboard.vue";
</script>
<style scoped>
.h-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
}

.h-dash {
  flex: 1;
  height: 100%;
  width: 100%;
}

.dashboard {
  width: 100%;
}
</style>
