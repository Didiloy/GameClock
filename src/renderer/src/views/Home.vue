<template>
  <div class="h-container">
    <Image :src="logo" width="250" class="header" />
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
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
}

.h-dash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.dashboard {
  width: 100%;
}
</style>
