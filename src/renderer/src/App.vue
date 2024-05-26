<script setup>
import TitleBar from "./components/TitleBar.vue";
import Sidebar from "./components/Sidebar.vue";
import { useRouter } from "vue-router";
import { initialiseFirebase } from "./database/firebaseConfig";
import { getPreferences } from "./preferences/preferences";
import { onMounted, onUnmounted, ref } from "vue";
const router = useRouter();
const storeDatabases = useStoredDatabases();
const { stored_databases, loadDatabases } = storeToRefs(storeDatabases);
if (stored_databases.value.length === 0) {
  router.push("/adddatabase");
} else {
  initialiseFirebase(
    stored_databases,
    getPreferences("selected_database_index")
  );
}
import { useStore, useStoredDatabases } from "./store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { loaded } = storeToRefs(store);
const chrono = ref(false);

function keyEventToggleChrono(e) {
  if (
    e.key === getPreferences("toggle_chronometer_key_shortcut").toLowerCase() ||
    e.key === getPreferences("toggle_chronometer_key_shortcut").toUpperCase()
  ) {
    toggleChrono();
  }
}

onMounted(() => {
  document.addEventListener("keyup", keyEventToggleChrono);
});
onUnmounted(() => {
  document.removeEventListener("keyup", keyEventToggleChrono);
});

function toggleChrono() {
  chrono.value = !chrono.value;
  console.log("chrono value:", chrono);
}
</script>

<template>
  <div class="container">
    <TitleBar :toggleChrono="chrono" />
    <div class="app-container main-background">
      <div class="sidebar">
        <Sidebar></Sidebar>
      </div>
      <div v-if="!loaded && stored_databases.length > 0" class="content">
        <div class="a-loading">
          <h2>Chargement des données</h2>
          <ProgressSpinner />
        </div>
      </div>
      <div v-else class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.app-container {
  display: grid;
  grid-template-columns: 185px auto;
  height: 100%;
  width: 100%;
  overflow-y: hidden;
  margin-top: 32px;
}

:global(.main-background) {
  background-color: var(--primary-50);
}

.sidebar {
  height: calc(100vh - 32px);
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px 10px 3px;
  border-right: 1px solid var(--primary-100);
}

.a-loading {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  height: 50vh;
  width: 100%;
}

h2 {
  color: #5a5d9d;
  font-size: 2rem;
}

.content {
  padding: 5px;
  width: 100%;
  overflow-y: auto;
  margin-bottom: 25px;
}
</style>
