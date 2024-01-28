<template>
  <div class="component-container">
    <Card class="card">
      <template #title> Ajouter une session </template>
      <template #content>
        <div class="content-container">
          <div class="left">
            <AutoComplete
              v-model="game"
              placeholder="Nom du jeu"
              :suggestions="items"
              @complete="autocomplete"
              class="mb10"
            ></AutoComplete>
            <div class="input-duration">
              <label for="duration" class="">
                Durée de la session en minutes</label
              >
              <InputNumber
                id="duration"
                v-model="duration"
                showButtons
                placeholder="Durée"
              ></InputNumber>
            </div>
          </div>
          <div class="right">
            <SelectButton
              v-model="was_cool"
              :options="options_cool"
              optionLabel="name"
              aria-labelledby="basic"
              class="mb10"
            />
            <Button
              label="Ajouter"
              :icon="icon"
              class="btn-add"
              @click="addNewSession"
              :loading="loading"
            ></Button>
          </div>
        </div>
      </template>
    </Card>
  </div>
  <Toast />
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { addSession } from "../database/database";

const store = useStore();
const { games } = storeToRefs(store);
const toast = useToast();
const props = defineProps(["teamName"]);
const all_games = ref(games);
const items = ref([]);
const loading = ref(false);
const icon = ref("pi pi-plus");
const game = ref("");
const duration = ref(0);
const was_cool = ref({});
const options_cool = ref([
  { name: "C'était cool", value: true },
  { name: "C'était pas cool", value: false },
]);

onMounted(() => {
  init();
});

async function init() {}

const autocomplete = (event) => {
  let tmpArray = all_games.value.filter((item) => {
    return item.name.toLowerCase().includes(event.query.toLowerCase());
  });
  items.value = tmpArray.map((item) => {
    return item.name;
  });
};

async function addNewSession() {
  loading.value = true;
  const success = await addSession(
    props.teamName,
    game.value,
    duration.value,
    was_cool.value.value
  );
  loading.value = false;
  if (success) {
    icon.value = "pi pi-check";
    toast.add({
      severity: "success",
      summary: "",
      detail: "C'est tout bon !",
      life: 3000,
    });
    await store.reloadStore();
    console.log("store reloaded");
  } else {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Une erreur est survenue lors de l'ajout de la session de jeu.",
      life: 3000,
    });
  }
  game.value = "";
  duration.value = 0;
  was_cool.value = true;
}
</script>
<style scoped>
.component-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.input-duration {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.card {
  background-color: var(--primary-100);
  width: 100%;
}

.content-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
}

.mb10 {
  margin-bottom: 10px;
}
</style>
