<script setup>
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="container">
    <div class="sidebar">
      <Sidebar></Sidebar>
    </div>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
}

.content {
  margin-left: 200px;
  padding: 20px;
  flex: 1; /* Takes remaining width */
}
</style>
