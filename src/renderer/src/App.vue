<script setup>
import Sidebar from "./components/Sidebar.vue";
import { onMounted } from "vue";
import { useStore } from "./store/store.js";

onMounted(() => {
  init();
});

const store = useStore();

async function init() {
  await store.reloadStore();
}
</script>

<template>
  <div class="container main-background">
    <div class="sidebar">
      <Sidebar></Sidebar>
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
}

:global(.main-background) {
  background-color: var(--primary-50);
}

.content {
  margin-left: 200px;
  padding: 20px;
  flex: 1; /* Takes remaining width */
}
</style>
