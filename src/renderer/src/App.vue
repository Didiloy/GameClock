<script setup>
import Sidebar from "./components/Sidebar.vue";
import { useRouter } from "vue-router";
import { initialiseFirebase } from "./database/firebaseConfig";
import { getPreferences } from "./preferences/preferences";
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
import { onMounted } from "vue";
const store = useStore();
const { sessions, games, teams, loaded } = storeToRefs(store);

function handleWindowControls() {
  // Make minimise/maximise/close buttons work when they are clicked
  document.getElementById("min-button").addEventListener("click", (event) => {
    window.electron.ipcRenderer.send("minimize");
  });

  document.getElementById("max-button").addEventListener("click", (event) => {
    window.electron.ipcRenderer.send("maximize");
  });

  document.getElementById("close-button").addEventListener("click", (event) => {
    window.electron.ipcRenderer.send("close");
  });
}

onMounted(() => {
  handleWindowControls();
});
</script>

<template>
  <div class="container">
    <div id="header">
      <div id="drag-region">
        <div id="window-title">
          <img
            src="./assets/images/icons.png"
            draggable="false"
            style="height: 25px; width: auto"
          />
          <!-- <span>GameClock</span> -->
        </div>
        <div id="window-controls">
          <div class="button" id="min-button">
            <img
              class="icon"
              src="./assets/images/minimize_icon.svg"
              draggable="false"
            />
          </div>

          <div class="button" id="max-button">
            <img
              class="icon-max"
              src="./assets/images/maximize_icon.svg"
              draggable="false"
            />
          </div>

          <div class="button" id="close-button">
            <img
              class="icon"
              src="./assets/images/close_icon.svg"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </div>
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

#header {
  display: block;
  position: fixed;
  top: 0;
  height: 32px;
  width: 100%; /*Compensate for body 1px border*/
  background: var(--primary-100);
  padding: 4px;
  -webkit-user-select: none;
  user-select: none;
  z-index: 1;
}

#header #drag-region {
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;
  display: grid;
  grid-template-columns: auto 138px;
}

#window-title {
  grid-column: 1;
  display: flex;
  align-items: center;
  margin-left: 8px;
  overflow: hidden;
  font-family: "Segoe UI", sans-serif;
  font-size: 15px;
}

#window-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

#window-controls {
  display: grid;
  grid-template-columns: repeat(3, 46px);
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
}

#window-controls .button {
  grid-row: 1 / span 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
#min-button {
  grid-column: 1;
}
#max-button {
  grid-column: 2;
}
#close-button {
  grid-column: 3;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-max {
  width: 16px;
  height: 16px;
}

#window-controls {
  -webkit-app-region: no-drag;
}

#window-controls .button {
  user-select: none;
}
#window-controls .button:hover {
  background: var(--primary-200);
}
#window-controls .button:active {
  background: var(--primary-300);
}

#close-button:hover {
  background: #e81123 !important;
}
#close-button:active {
  background: #f1707a !important;
}
#close-button:active .icon {
  filter: invert(1);
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
