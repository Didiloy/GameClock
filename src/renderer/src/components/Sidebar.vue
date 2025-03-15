<template>
  <div class="sidebar-container">
    <div class="s-content">
      <div style="width: 100%">
        <div v-for="(item, i) in items" :key="i" class="menu">
          <h3 class="menu-item">{{ item.label }}</h3>
          <router-link
            v-for="(subitem, j) in item.items"
            v-slot="{ navigate }"
            :to="subitem.route"
            :key="j"
            class="router-link link"
          >
            <div>
              <a :href="subitem.route" @click="navigate">
                <span :class="subitem.icon" />
                <span class="ml">{{ subitem.label }}</span>
              </a>
            </div>
          </router-link>
        </div>
      </div>
      <div class="div-reload-button">
        <Divider />
        <Button
          class="reload-button"
          :label="$t('Sidebar.reload_data')"
          @click="onReload"
          :icon="icon"
          :loading="loading"
        ></Button>
        <span class="sidebar-version"
          >{{ $t("Sidebar.version") }} {{ app_info.version }}</span
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "../store/store.js";
import app_info from "../../../../package.json";
import { useI18n } from "vue-i18n";
const i18n = useI18n();

const loading = ref(false);
const icon = ref("pi pi-replay");

const items = ref([
  {
    label: "",
    items: [
      {
        label: i18n.t("Sidebar.home"),
        icon: "pi pi-home",
        route: "/",
      },
    ],
  },
  {
    label: i18n.t("Sidebar.teams.label"),
    items: [
      {
        label: i18n.t("Sidebar.teams.add"),
        icon: "pi pi-plus",
        route: "/addteam",
      },
      {
        label: i18n.t("Sidebar.teams.list"),
        icon: "pi pi-list",
        route: "/teams",
      },
    ],
  },
  {
    label: i18n.t("Sidebar.sessions.label"),
    items: [
      {
        label: i18n.t("Sidebar.sessions.retry_list"),
        icon: "pi pi-hourglass",
        route: "/waiting-list-sessions",
      },
      {
        label: i18n.t("Sidebar.sessions.search"),
        icon: "pi pi-search",
        //TODO
        route: "TODO",
      },
    ],
  },
  {
    label: i18n.t("Sidebar.settings.label"),
    items: [
      {
        label: i18n.t("Sidebar.settings.games"),
        icon: "pi pi-play",
        route: "/settings/games",
      },
      {
        label: i18n.t("Sidebar.settings.general"),
        icon: "pi pi-cog",
        route: "/settings/general",
      },
      {
        label: i18n.t("Sidebar.settings.databases"),
        icon: "pi pi-database",
        route: "/settings/databases",
      },
    ],
  },
]);

async function onReload() {
  loading.value = true;
  await useStore().reloadStore();
  loading.value = false;
}
</script>

<style scoped>
h3 {
  margin: 10px;
}

.sidebar-container {
  height: 100%;
  -webkit-user-select: none;
  user-select: none;
  -webkit-app-region: drag;
}

.s-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  height: 100%;
}

.div-reload-button {
  height: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  -webkit-app-region: no-drag;
}

.reload-button {
  width: 100%;
}

.menu {
  width: 100%;
  border: none;
  -webkit-app-region: no-drag;
}

.link {
  height: 40px;
  width: 100%;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: start;
  align-items: center;
  padding-left: 10px;
  -webkit-app-region: no-drag;
}

.link:hover {
  background-color: var(--primary-300);
  color: var(--highlight-text-color);
}

.router-link {
  width: 100%;
}

a:link {
  text-decoration: none;
  color: var(--text-color);
}

a:visited {
  text-decoration: none;
  color: var(--text-color);
}

a:hover {
  text-decoration: none;
  color: var(--text-color);
}

a:active {
  text-decoration: none;
  color: var(--text-color);
}

.ml {
  margin-left: 10px;
}

.sidebar-version {
  font-style: italic;
}
</style>
