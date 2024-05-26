<template>
  <Card
    class="card"
    :pt="{
      root: { style: 'box-shadow: 0px 0px 0px 0px;' },
      content: { style: 'height:100%; width: auto;' },
    }"
  >
    <template #content>
      <div class="content-container">
        <div class="as-input">
          <AutoComplete
            class="input-field mb10"
            v-model="game"
            placeholder="Nom du jeu"
            :suggestions="items"
            @complete="autocomplete"
          ></AutoComplete>
          <div class="as-duration-input">
            <span class="as-icon" @click="toggleOverlay"
              ><i class="pi pi-info"></i
            ></span>
            <OverlayPanel ref="op">
              <span>
                Vous pouvez entrer une durée en minutes ou utiliser une formule
                pour additionner plusieurs durées. Par exemple, pour ajouter 10
                minutes et 20 minutes, entrez "=10+20".
              </span>
            </OverlayPanel>
            <InputText
              class="input-number"
              v-model="duration"
              placeholder="Durée en minute"
            ></InputText>
            <div>
              <Button
                icon="pi pi-clock"
                @click="startStopWatch"
                style="background-color: var(--primary-400)"
                class="as-chrono-button"
              />
            </div>
          </div>
        </div>
        <div class="as-fun-selector mb10">
          <ToggleButton
            v-model="toggle_fun"
            onLabel="Fun"
            offLabel="Fun"
            class="toggle-button"
            style="color: var(--text-primary)"
            :pt="{
              root: {
                style: toggle_fun
                  ? 'background-color: var(--primary-400);'
                  : 'background-color: whitesmoke;',
              },
            }"
          />
          <ToggleButton
            v-model="toggle_neutre"
            onLabel="Neutre"
            offLabel="Neutre"
            class="toggle-button"
            style="color: var(--text-primary)"
            :pt="{
              root: {
                style: toggle_neutre
                  ? 'background-color: var(--primary-400);'
                  : 'background-color: whitesmoke;',
              },
            }"
          />
          <ToggleButton
            v-model="toggle_nul"
            onLabel="Nul"
            offLabel="Nul"
            class="toggle-button"
            style="color: var(--text-primary)"
            :pt="{
              root: {
                style: toggle_nul
                  ? 'background-color: var(--primary-400);'
                  : 'background-color: whitesmoke;',
              },
            }"
          />
        </div>
        <Button
          label="Ajouter"
          :icon="icon"
          class="btn-add"
          @click="addNewSession"
          :loading="loading"
        ></Button>
      </div>
    </template>
  </Card>
  <Toast />
</template>
<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useStore, useStoreChrono } from "../store/store";
import { storeToRefs } from "pinia";
import { addSession } from "../database/database";
import { getPreferences } from "../preferences/preferences";

const storeChrono = useStoreChrono();
const { chrono_value } = storeToRefs(storeChrono);
const store = useStore();
const { games } = storeToRefs(store);
const toast = useToast();
const props = defineProps(["teamName", "gameName"]);
const all_games = ref(games);
const items = ref([]);
const loading = ref(false);
const icon = ref("pi pi-plus");
const game = ref("");
const duration = ref();
const was_cool = ref({});
const options_cool = ref([
  { name: "Bien", value: true },
  { name: "Neutre", value: undefined },
  { name: "Nul", value: false },
]);
const toggle_fun = ref(false);
const toggle_neutre = ref(false);
const toggle_nul = ref(false);

watch(toggle_fun, () => {
  if (toggle_fun.value) {
    toggle_neutre.value = false;
    toggle_nul.value = false;
    was_cool.value = { value: true };
  }
});

watch(toggle_neutre, () => {
  if (toggle_neutre.value) {
    toggle_fun.value = false;
    toggle_nul.value = false;
    was_cool.value = { value: undefined };
  }
});

watch(toggle_nul, () => {
  if (toggle_nul.value) {
    toggle_neutre.value = false;
    toggle_fun.value = false;
    was_cool.value = { value: false };
  }
});

function startStopWatch() {
  duration.value = chrono_value.value;
}

onMounted(() => {
  if (props.gameName) {
    game.value = props.gameName;
  }
});

const op = ref();
const toggleOverlay = () => {
  op.value.toggle(event);
};

const autocomplete = (event) => {
  let tmpArray = all_games.value.filter((item) => {
    return item.name.toLowerCase().includes(event.query.toLowerCase());
  });
  items.value = tmpArray.map((item) => {
    return item.name;
  });
};

const regex = new RegExp("^[1-9]\\d*$"); //vérifie si le nombre entré ne commence pas par un 0

async function addNewSession() {
  loading.value = true;

  if (duration.value[0] === "=") {
    duration.value = duration.value.replace(/\s+/g, "");
    let operandes = duration.value.slice(1).split("+");
    duration.value = 0;
    operandes.forEach((operand) => {
      if (!regex.test(operand)) {
        toast.add({
          severity: "error",
          summary: "",
          detail:
            "Les opérandes d'une formule doivent être des nombres entiers et vous ne pouvez utiliser que l'addition.",
          life: 3000,
        });
        loading.value = false;
        duration.value = "";
        return;
      }
      duration.value += parseInt(operand);
    });
  } else if (!regex.test(duration.value || !game.value)) {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Veuillez remplir tous les champs correctement.",
      life: 3000,
    });
    loading.value = false;
    return;
  }

  const success = await addSession(
    props.teamName,
    game.value,
    parseInt(duration.value),
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
    if (getPreferences("reload_data_after_adding_session")) {
      setTimeout(async () => {
        await store.reloadStore();
      }, 3000);
    }
  } else {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Une erreur est survenue lors de l'ajout de la session de jeu.",
      life: 3000,
    });
  }
  game.value = "";
  duration.value = "";
}
</script>
<style scoped>
.card {
  background-color: var(--primary-100);
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

.content-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.as-input {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.as-duration-input {
  display: flex;
  flex-direction: row;
  justify-content: end;
  align-items: center;
  width: 100%;
}

.input-field {
  width: 300px;
}

.input-number {
  margin-right: 80px;
}

.as-fun-selector {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  width: 100%;
  background-color: whitesmoke;
  border-radius: 10px;
  padding: 5px;
}

.toggle-button {
  width: 90%;
  height: 90%;
  border: none;
  margin: 0 5px;
}

.as-chrono-button {
  flex: 1;
}

.chrono-time {
  margin-right: 100px;
  font-size: 1.5rem;
  font-weight: bold;
}

.as-icon {
  margin-right: 10px;
  background-color: whitesmoke;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--primary-400);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.as-icon:hover {
  cursor: pointer;
}

.mb10 {
  margin-bottom: 10px;
}
</style>
