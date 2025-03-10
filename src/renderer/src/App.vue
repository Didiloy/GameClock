<script setup>
import TitleBar from "./components/TitleBar.vue";
import Sidebar from "./components/Sidebar.vue";
import Loading from "./components/Loading.vue";
import NewVersionDialog from "./components/NewVersionDialog.vue";
import { useRouter } from "vue-router";
import { getPreferences } from "./preferences/preferences";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { isThereNewVersion } from "./common/new_version";
const router = useRouter();
const storeDatabases = useStoredDatabases();
const { stored_databases } = storeToRefs(storeDatabases);

import { useStore, useStoredDatabases } from "./store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { loaded, teams, first_load, store_error } = storeToRefs(store);
const chrono = ref(false);
const listener_added = ref(false);

async function keyEventToggleChrono(e) {
  if (
    e.key === getPreferences("toggle_chronometer_key_shortcut").toLowerCase() ||
    e.key === getPreferences("toggle_chronometer_key_shortcut").toUpperCase()
  ) {
    toggleChrono();
  }
  if (
    e.key === getPreferences("reload_data_key_shortcut").toLowerCase() ||
    e.key === getPreferences("reload_data_key_shortcut").toUpperCase()
  ) {
    store.reloadStore();
  }
}

const prefered_page = ref({
  label: getPreferences("default_start_page"),
  route: getPreferences("default_start_page_route"),
});

const new_version_available = ref(false);

watch(teams, () => {
  if (verifyIfTeamExist()) {
    if (first_load.value) router.push(prefered_page.value.route);
  }
});

onMounted(async () => {
  changeTheme();
  addChronoListener();
  if (getPreferences("check_for_update_at_startup")) {
    new_version_available.value = await isThereNewVersion();
  }
});

watch(store_error, () => {
  if (store_error.value !== undefined && store_error.value !== "") {
    router.push("/database-error");
  }
});

onUnmounted(() => {
  removeChronoListener();
});

function addChronoListener() {
  document.addEventListener("keyup", keyEventToggleChrono);
  listener_added.value = true;
}

function removeChronoListener() {
  document.removeEventListener("keyup", keyEventToggleChrono);
  listener_added.value = false;
}

function toggleChronoListener() {
  if (listener_added.value) {
    removeChronoListener();
  } else {
    addChronoListener();
  }
}

function verifyIfTeamExist() {
  if (!prefered_page.value.route.includes("/team/")) {
    return true;
  }
  let exist = false;
  for (const t of teams.value) {
    if (t.name === prefered_page.value.label) {
      exist = true;
    }
  }
  return exist;
}

function toggleChrono() {
  chrono.value = !chrono.value;
}

const selected_accent_color = ref(getPreferences("accent_color"));
const selected_style = ref(getPreferences("application_style"));
function changeTheme() {
  const themeLink = document.getElementById("theme-link");
  themeLink.href = `/${selected_style.value}-light-${selected_accent_color.value}/theme.css`;
}
</script>

<template>
  <div class="container">
    <TitleBar
      :toggleChrono="chrono"
      @toggleChronoListener="toggleChronoListener"
      :data_loaded="loaded"
    />
    <div class="app-container">
      <div v-if="loaded && stored_databases.length > 0" class="sidebar">
        <Sidebar></Sidebar>
      </div>
      <div v-if="!loaded && stored_databases.length > 0" class="content">
        <Loading msg="loading_data" />
      </div>
      <div v-else class="content">
        <div class="inner-content">
          <router-view @toggleChronoListener="toggleChronoListener" />
        </div>
      </div>
    </div>
    <Dialog
      v-model:visible="new_version_available"
      modal
      dismissableMask
      closeOnEscape
      :showHeader="false"
      :pt="{
        content: {
          style:
            'height: 600px; width: 800px; border-radius: 15px; margin: 0; padding: 0;',
        },
      }"
    >
      <NewVersionDialog />
    </Dialog>
  </div>
</template>

<style scoped>
.container {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: var(--primary-100);
}

.app-container {
  margin-top: 32px;
  height: calc(100% - 32px);
  width: 100%;
  display: flex;
  flex-direction: row;
}

:global(.main-background) {
  background-color: var(--surface-100);
}

.sidebar {
  height: 100%;
  width: 185px;
  justify-content: center;
  align-items: center;
  padding: 10px 10px 3px;
  background-color: var(--primary-100);
}

.a-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h2 {
  color: #5a5d9d;
  font-size: 2rem;
}

.content {
  width: calc(100% - 6px);
  height: calc(100% - 6px);
  border-radius: 10px;
  overflow-y: hidden;
  background-color: var(--surface-100);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.inner-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}
</style>
