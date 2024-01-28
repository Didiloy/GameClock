<script setup>
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="app-container main-background">
    <div class="sidebar">
      <Sidebar></Sidebar>
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100%;
  width: 100%;
}

:global(.main-background) {
  background-color: var(--primary-50);
}

.content {
  margin-left: 200px;
  padding: 5px;
  height: 100%;
  width: 100%;
  flex: 1; /* Takes remaining width */
}
</style>
