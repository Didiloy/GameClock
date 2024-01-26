<template>
  <div class="sgs-container">
    <Card class="card">
      <template #content>
        <div class="sgs-container">
          <div class="sgs-left">
            <label for="name">Nom du jeu</label>
            <InputText id="name" type="text" v-model="name" />
            <label for="logo">Logo du jeu</label>
            <InputText id="logo" type="text" v-model="logo" />
            <label for="heroe">Image du jeu</label>
            <InputText id="heroe" type="text" v-model="heroe" />
          </div>
          <div class="sgs-right">
            <Button
              label="Modifier"
              :icon="icon"
              class="btn-add"
              @click="useModifyGame"
              :loading="loading"
            ></Button>
          </div>
        </div>
      </template>
    </Card>
    <Toast />
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { modifyGame } from "../database/database";
import { useStore } from "../store/store";
import { useToast } from "primevue/usetoast";

const props = defineProps(["name", "logo", "heroe"]);
const name = ref(props.name);
const logo = ref(props.logo);
const heroe = ref(props.heroe);
const heroe_url = computed(() => {
  return "url(" + props.heroe + ")";
});

const store = useStore();
const icon = ref("pi pi-cloud-upload");
const loading = ref(false);
const toast = useToast();

async function useModifyGame() {
  loading.value = true;
  const success = await modifyGame(name.value, logo.value, heroe.value);
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
  } else {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Une erreur est survenue lors de l'ajout de la session de jeu.",
      life: 3000,
    });
  }
}
</script>
<style scoped>
.sgs-container {
  width: 100%;
}
.card {
  background-image: v-bind(heroe_url);
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
}

.sgs-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}

.sgs-left {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 50%;
  height: 100%;
}

.sgs-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 100%;
}

label {
  color: var(--surface-0);
  margin-top: 5px;
  text-shadow: 2px 0 0 #000;
  font-size: 20px;
}
</style>
