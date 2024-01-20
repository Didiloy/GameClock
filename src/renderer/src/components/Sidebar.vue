<template>
  <div>
    <Sidebar
      :visible="true"
      style="width: 200px"
      :showCloseIcon="false"
      :modal="false"
    >
      <template #header>
        <Image :src="logo" width="50" />
        <h3>GameClock</h3>
      </template>
      <Divider />
      <div>
        <div v-for="item in items" class="menu">
          <h3 class="menu-item">{{ item.label }}</h3>
          <div v-for="subitem in item.items" class="link">
            <router-link
              v-slot="{ navigate }"
              :to="subitem.route"
              class="router-link"
            >
              <a :href="subitem.route" @click="navigate">
                <span :class="subitem.icon" />
                <span class="ml">{{ subitem.label }}</span>
              </a>
            </router-link>
          </div>
        </div>
      </div>
    </Sidebar>
  </div>
</template>

<script setup>
import logo from "../assets/images/logo.jpeg";
import { ref } from "vue";

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
    label: "Général",
    items: [
      {
        label: "Statistiques",
        icon: "pi pi-chart-line",
        route: "/stats",
      },
    ],
  },
]);
</script>

<style scoped>
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
  background-color: var(--primary-200);
  color: var(--highlight-text-color);
}

.router-link {
  width: 100;
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
