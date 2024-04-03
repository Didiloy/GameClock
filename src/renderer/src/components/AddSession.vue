<template>
  <Card class="card"
        :pt="{
            root: { style: 'box-shadow: 0px 0px 0px 0px;' },
            content: { style: 'height:100%; width: auto;' }
        }">
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
            <InputNumber
                v-if="!is_chrono_running"
                class="input-field input-number"
                v-model="duration"
                placeholder="Durée en minute"
            ></InputNumber>
            <span v-else class="chrono-time">
              {{ convertSecondsToMinutesSeconds(duration_seconds) }}
            </span>
            <div>
              <Button icon="pi pi-clock"
                      :label="is_chrono_running > 0 ? 'Stop' : ''" @click="startStopWatch"
                      :style="'background-color:' + getChronoButtonColor() +';'"
                      class="as-chrono-button"
              />
            </div>
          </div>
        </div>
        <div class="as-fun-selector mb10">
          <ToggleButton v-model="toggle_fun" onLabel="Fun" offLabel="Fun"
                        style="background-color: var(--green-400); color: whitesmoke"/>
          <ToggleButton v-model="toggle_neutre" onLabel="Neutre" offLabel="Neutre"
                        style="background-color: var(--gray-400); color: whitesmoke"/>
          <ToggleButton v-model="toggle_nul" onLabel="Nul" offLabel="Nul"
                        style="background-color: var(--red-400); color: whitesmoke"/>
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
  <Toast/>
</template>
<script setup>
import {onMounted, ref, watch} from "vue";
import {useToast} from "primevue/usetoast";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {addSession} from "../database/database";
import {getPreferences} from "../preferences/preferences";

const store = useStore();
const {games} = storeToRefs(store);
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
  {name: "Bien", value: true},
  {name: "Neutre", value: undefined},
  {name: "Nul", value: false},
]);
const toggle_fun = ref(false);
const toggle_neutre = ref(false);
const toggle_nul = ref(false);

watch(toggle_fun, () => {
  if (toggle_fun.value) {
    toggle_neutre.value = false;
    toggle_nul.value = false;
    was_cool.value = {value: true};
  }
});

watch(toggle_neutre, () => {
  if (toggle_neutre.value) {
    toggle_fun.value = false;
    toggle_nul.value = false;
    was_cool.value = {value: undefined};
  }
});

watch(toggle_nul, () => {
  if (toggle_nul.value) {
    toggle_neutre.value = false;
    toggle_fun.value = false;
    was_cool.value = {value: false};
  }
});

const timestamp_start_chrono = ref(0);

const duration_seconds = ref(0);
const is_chrono_running = ref(false);

function startStopWatch() {
  if (!is_chrono_running.value) {
    timestamp_start_chrono.value = Date.now();
    duration.value = 0;
    is_chrono_running.value = !is_chrono_running.value;
  } else {
    is_chrono_running.value = !is_chrono_running.value;
  }
}

watch(duration_seconds, () => {
  duration.value = Math.floor(duration_seconds.value / 60);
});

onMounted(() => {
  if (props.gameName) {
    game.value = props.gameName;
  }
});

setInterval(() => {
  if (is_chrono_running.value) {
    duration_seconds.value = (Date.now() - timestamp_start_chrono.value) / 1000;
  }
}, 1000);

const autocomplete = (event) => {
  let tmpArray = all_games.value.filter((item) => {
    return item.name.toLowerCase().includes(event.query.toLowerCase());
  });
  items.value = tmpArray.map((item) => {
    return item.name;
  });
};

function convertSecondsToMinutesSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = (seconds % 60).toFixed(0);

  let result = "";

  if (minutes > 0) {
    result += minutes + "m";
  }

  if (remainingSeconds > 0) {
    if (result !== "") {
      result += " ";
    }
    result += remainingSeconds + "s";
  }

  return result;
}

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
  duration.value = 0;
}

function getChronoButtonColor() {
  return is_chrono_running.value ? 'var(--red-400)' : 'var(--primary-400)';
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
  width: 200px;
}

.input-number {
  margin-right: 108px;
}

.as-fun-selector {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  width: 100%;
}

.as-chrono-button {
  flex: 1;
}

.chrono-time {
  margin-right: 100px;
  font-size: 1.5rem;
  font-weight: bold;
}

.mb10 {
  margin-bottom: 10px;
}
</style>
