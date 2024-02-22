<template>
  <div>
    <Sidebar
      :visible="true"
      style="width: 185px"
      :showCloseIcon="false"
      :modal="false"
      class="main-background"
    >
      <template #header>
        <Image :src="logo" width="150" class="header" />
      </template>
      <Divider />
      <div>
        <div v-for="item in items" class="menu">
          <h3 class="menu-item">{{ item.label }}</h3>
          <router-link
            v-for="subitem in item.items"
            v-slot="{ navigate }"
            :to="subitem.route"
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
        <Button class="reload-button" label="Recharger les données" @click="onReload" :icon="icon" :loading="loading"></Button>
      </div>
    </Sidebar>
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
import { ref } from "vue";
import {useStore} from "../store/store.js";
import {addTeam} from "../database/database";

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
  // {
  //   label: "Général",
  //   items: [
  //     {
  //       label: "Statistiques",
  //       icon: "pi pi-chart-line",
  //       route: "/stats",
  //     },
  //   ],
  // },
  {
    label: "Paramètres",
    items: [
      {
        label: "Jeux",
        icon: "pi pi-play",
        route: "/settings/games",
      },
    ],
  },
]);

async function onReload(){
  loading.value = true;
  await useStore().reloadStore();
  loading.value = false;
}
</script>

<style scoped>
.header {
  margin-top: 5px;
}

.div-reload-button{
  position: absolute;
  bottom: 10px;
  left: 0px;
  border: none;
  margin-left: 0px;
  margin-top: 0px;
  height: auto;
  width: 100%;
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
}

.reload-button{
  width: 90%;
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
</style>
