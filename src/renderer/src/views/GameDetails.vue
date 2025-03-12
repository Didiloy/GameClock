<template>
  <div v-if="loading">
    <Loading msg="calculating_statistics" />
  </div>
  <div
    v-else
    class="game-details-container"
    :style="`--bg-url: url('${selected_hero}')`"
  >
    <div class="background-container"></div>

    <div class="overlay-container">
      <div class="content-container-left">
        <div class="div-img">
          <img :src="logo" class="img-heroe" />
          <label for="logo" class="gd-label">{{
            $t("SingleGameSetting.game_logo")
          }}</label>
          <InputText
            id="logo"
            type="text"
            v-model="logo"
            style="width: 70%"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
            @contextmenu="onRightClickLogo"
          />
          <ContextMenu ref="menu_logo" :model="items" />
        </div>
        <div class="div-img">
          <img :src="grid" class="img-heroe" />
          <label for="heroe" class="gd-label">{{
            $t("SingleGameSetting.game_grid")
          }}</label>
          <InputText
            id="heroe"
            type="text"
            v-model="grid"
            style="width: 70%"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
            @contextmenu="onRightClickGrid"
          />
          <ContextMenu ref="menu_heroe" :model="items_heroe" />
        </div>
        <div class="div-img">
          <img :src="heroe" class="img-heroe" />
          <label for="heroe" class="gd-label">{{
            $t("SingleGameSetting.game_heroe")
          }}</label>
          <InputText
            id="grid"
            type="text"
            v-model="heroe"
            style="width: 70%"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
            @contextmenu="onRightClickHeroe"
          />
          <ContextMenu ref="menu_grid" :model="items_grid" />
        </div>
        <Button
          :label="i18n.t('SingleGameSetting.modify')"
          :icon="icon"
          class="btn-add"
          @click="useModifyGame"
          :loading="loading_modifying"
          style="margin-top: 10px"
        ></Button>
      </div>

      <div class="content-container-right">
        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>

        <div class="div-img">
          <img :src="selected_game.heroe" class="img-heroe" />
          <input type="text" />
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>
<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { modifyGame } from "../database/database";
import Loading from "../components/Loading.vue";
import { useToast } from "primevue/usetoast";
const toast = useToast();
import { useI18n } from "vue-i18n";
const i18n = useI18n();
const store = useStore();
const { teams, sessions, games } = storeToRefs(store);
const loading = ref(true);
const props = defineProps(["id"]);
const emit = defineEmits(["toggleChronoListener"]);
const selected_game = ref(null);
const selected_hero = computed(() => {
  return selected_game.value?.heroe || null;
});

const loading_modifying = ref(false);
const icon = ref("pi pi-cloud-upload");

const logo = ref("");
const heroe = ref("");
const grid = ref("");

onMounted(() => {
  selected_game.value = getGameById(props.id);
  logo.value = selected_game.value.logo;
  heroe.value = selected_game.value.heroe;
  grid.value = selected_game.value.grid;

  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

function getGameById(id) {
  return games.value.find((game) => game.id === id);
}

async function paste(input) {
  const text = await navigator.clipboard.readText();
  input.value = text;
}

const menu_logo = ref();
const items = ref([
  {
    label: i18n.t("SingleGameSetting.copy"),
    icon: "pi pi-copy",
    command: () => {
      navigator.clipboard.writeText(logo.value);
    },
  },
  {
    label: i18n.t("SingleGameSetting.paste"),
    icon: "pi pi-clone",
    command: () => {
      paste(logo);
    },
  },
]);

const menu_heroe = ref();
const items_heroe = ref([
  {
    label: i18n.t("SingleGameSetting.copy"),
    icon: "pi pi-copy",
    command: () => {
      navigator.clipboard.writeText(heroe.value);
    },
  },
  {
    label: i18n.t("SingleGameSetting.paste"),
    icon: "pi pi-clone",
    command: () => {
      paste(heroe);
    },
  },
]);

const menu_grid = ref();
const items_grid = ref([
  {
    label: i18n.t("SingleGameSetting.copy"),
    icon: "pi pi-copy",
    command: () => {
      navigator.clipboard.writeText(grid.value);
    },
  },
  {
    label: i18n.t("SingleGameSetting.paste"),
    icon: "pi pi-clone",
    command: () => {
      paste(grid);
    },
  },
]);

const onRightClickLogo = (event) => {
  menu_logo.value.show(event);
};

const onRightClickHeroe = (event) => {
  menu_heroe.value.show(event);
};

const onRightClickGrid = (event) => {
  menu_grid.value.show(event);
};

async function useModifyGame() {
  loading_modifying.value = true;
  const success = await modifyGame(
    selected_game.value.name,
    logo.value,
    heroe.value,
    grid.value,
  );
  loading_modifying.value = false;
  if (success) {
    icon.value = "pi pi-check";
    toast.add({
      severity: "success",
      summary: "",
      detail: i18n.t("SingleGameSetting.all_good"),
      life: 3000,
    });
    setTimeout(async () => {
      await store.reloadStore();
    }, 3000);
  } else {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("SingleGameSetting.error_when_modifying"),
      life: 3000,
    });
  }
}
</script>
<style scoped>
.game-details-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.background-container {
  width: 100%;
  height: 100%;
  background-image: var(--bg-url);
  background-size: cover;
  background-position: center;
  filter: blur(10px);
}

.overlay-container {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  width: 100%;
  height: 100%;
  z-index: 99;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.content-container-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.content-container-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.div-img {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  height: 30%;
}

.img-heroe {
  max-width: 90%;
  max-height: 55%;
  border-radius: 10px;
}

.gd-label {
  color: white;
}
</style>
