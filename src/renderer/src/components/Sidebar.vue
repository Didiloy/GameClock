<template>
  <div class="main-background container">
    <!-- <div>
      <Image :src="logo" width="150" class="header" />
    </div>
    <Divider /> -->
    <div class="s-content">
      <div style="width: 100%">
        <div v-for="(item, i) in items" :key="i" class="menu">
          <h3 class="menu-item">{{ item.label }}</h3>
          <router-link
            v-for="(subitem , j) in item.items"
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
          label="Recharger les données"
          @click="onReload"
          :icon="icon"
          :loading="loading"
        ></Button>
        <span class="sidebar-version">Version {{ app_info.version }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "../store/store.js";
import app_info from "../../../../package.json";

const loading = ref(false);
const icon = ref("pi pi-replay");

const items = ref([
  {
    label: "",
    items: [
      {
        label: "Accueil",
        icon: "pi pi-home",
        route: "/",
      },
    ],
  },
  {
    label: "Équipes",
    items: [
      {
        label: "Ajouter",
        icon: "pi pi-plus",
        route: "/addteam",
      },
      {
        label: "Liste",
        icon: "pi pi-list",
        route: "/teams",
      },
    ],
  },
  {
    label: "Paramètres",
    items: [
      {
        label: "Jeux",
        icon: "pi pi-play",
        route: "/settings/games",
      },
      {
        label: "Général",
        icon: "pi pi-cog",
        route: "/settings/general",
      },
      {
        label: "Base de données",
      icon: "pi pi-database",
      route: "/settings/databases"
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
.header {
  margin-top: 5px;
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
}

.reload-button {
  width: 100%;
}

.menu {
  width: 100%;
  border: none;
  margin-left: 0px;
}

.link {
  margin-top: 0px;
  height: 40px;
  width: 100%;
  border-radius: var(--border-radius);
  display: flex;
  justify-content: start;
  align-items: center;
  padding-left: 10px;
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
  margin-top: 5px;
  font-style: italic;
}
</style>
