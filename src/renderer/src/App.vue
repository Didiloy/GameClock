<script setup>
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="container main-background">
    <div class="sidebar">
      <Sidebar></Sidebar>
    </div>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
}

.main-background {
  background-color: var(--primary-50);
}

.content {
  margin-left: 200px;
  padding: 20px;
  flex: 1; /* Takes remaining width */
}
</style>
