<template>
  <div class="as-background">
    <div class="as-container">
      <div class="as-game-image">
        <img :src="game_grid" alt="game image" class="as-img-game-image"/>
      </div>
      <div class="as-input">
        <AutoComplete
            v-if="props.addToWaitingList"
            class="mb10"
            v-model="teamName"
            :placeholder="i18n.t('AddSession.team_name')"
            :suggestions="items_suggest_team"
            @complete="autocompleteTeam"
        >
        </AutoComplete>
        <AutoComplete
            class="mb10"
            v-model="game"
            :placeholder="i18n.t('AddSession.game_name')"
            :suggestions="items"
            @complete="autocomplete"
        >
        </AutoComplete>
        <div class="as-duration-input">
          <span class="as-icon" @click="toggleOverlay"
          ><i class="pi pi-info"></i
          ></span>
          <OverlayPanel ref="op" style="width: 50%">
            <span>
              {{ $t("AddSession.informative_text_formulas") }}
            </span>
          </OverlayPanel>
          <InputText
              class="input-number"
              v-model="duration"
              :placeholder="i18n.t('AddSession.duration_in_minute')"
          ></InputText>
          <div>
            <Button
                icon="pi pi-clock"
                @click="getChronoValue"
                style="background-color: var(--primary-400)"
                class="as-chrono-button"
            />
          </div>
        </div>
        <div class="as-fun-selector">
          <ToggleButton
              v-model="toggle_fun"
              :onLabel="i18n.t('AddSession.fun')"
              :offLabel="i18n.t('AddSession.fun')"
              class="toggle-button"
              :pt="{
              box: {
                style: toggle_fun
                  ? 'background-color: var(--green-400);'
                  : 'background-color: whitesmoke; border: none;',
              },
            }"
          />
          <ToggleButton
              v-model="toggle_neutre"
              :onLabel="i18n.t('AddSession.neutral')"
              :offLabel="i18n.t('AddSession.neutral')"
              class="toggle-button"
              :pt="{
              box: {
                style: toggle_neutre
                  ? 'background-color: var(--yellow-400);'
                  : 'background-color: whitesmoke; border: none;',
              },
            }"
          />
          <ToggleButton
              v-model="toggle_nul"
              :onLabel="i18n.t('AddSession.bad')"
              :offLabel="i18n.t('AddSession.bad')"
              class="toggle-button"
              :pt="{
              box: {
                style: toggle_nul
                  ? 'background-color: var(--red-400);'
                  : 'background-color: whitesmoke; border: none;',
              },
            }"
          />
        </div>
        <div class="as-comments">
          <TextArea v-model="comment" rows="1" cols="23" :placeholder="i18n.t('AddSession.comments')"/>
        </div>
      </div>
      <div class="as-select-platform">
        <SelectButton v-model="selected_platform"
                      :options="platforms_options"
                      optionLabel="name"
                      dataKey="id"
                      :pt="{
                          button: {
                            style: 'height: 10px;',
                          },
                        }"
        >
        </SelectButton>
      </div>
      <div class="as-button-add">
        <Button
            :label="i18n.t('AddSession.add')"
            :icon="icon"
            class="btn-add"
            @click="addNewSession"
            :loading="loading"
        ></Button>
      </div>
    </div>
  </div>
  <Toast/>
</template>
<script setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {useToast} from "primevue/usetoast";
import {useStore, useStoreChrono, useStoreWaitingList} from "../store/store";
import {storeToRefs} from "pinia";
import {addSession} from "../database/database";
import {getPreferences} from "../preferences/preferences";
import gameNotFound from "../assets/images/game_not_found.jpg";

import {useI18n} from "vue-i18n";

const i18n = useI18n();

const storeWaitingList = useStoreWaitingList();

const emit = defineEmits(["toggleChronoListener"]);
const storeChrono = useStoreChrono();
const {chrono_value} = storeToRefs(storeChrono);
const store = useStore();
const {games, teams, platforms} = storeToRefs(store);
const toast = useToast();
const props = defineProps(["teamName", "gameName", "addToWaitingList"]);
const all_games = ref(games);
const selected_platform = ref();
const items = ref([]);
const items_suggest_team = ref([]);
const loading = ref(false);
const comment = ref("");
const icon = ref("pi pi-plus");
const game = ref("");
const game_grid = computed(() => {
  return (
      all_games.value.find((g) => g.name === game.value)?.grid || gameNotFound
  );
});
const heroe_url = computed(() => {
  return all_games.value.find((g) => g.name === game.value)?.heroe !== undefined
      ? `url(${all_games.value.find((g) => g.name === game.value)?.heroe})`
      : ``;
});

const platforms_options = ref([]);

const duration = ref("");
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

function getChronoValue() {
  duration.value = chrono_value.value;
}

onMounted(() => {
  emit("toggleChronoListener");
  if (props.gameName) {
    game.value = props.gameName;
  }
  platforms_options.value = platforms.value.map((p) => {
    return {name: i18n.t("Platform." + p.name), id: p.id};
  });
  selected_platform.value = platforms.value.filter(
      (p) => p.name === "Not specified"
  )[0];
});

onUnmounted(() => {
  emit("toggleChronoListener");
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

const teamName = ref("");
if (props.teamName) {
  teamName.value = props.teamName;
}

const autocompleteTeam = (event) => {
  let tmpArray = teams.value.filter((item) => {
    return item.name.toLowerCase().includes(event.query.toLowerCase());
  });
  items_suggest_team.value = tmpArray.map((item) => {
    return item.name;
  });
};

const regex = new RegExp("^[1-9]\\d*$"); //vérifie si le nombre entré ne commence pas par un 0

function getTeamId() {
  return teams.value.find((g) => g.name === teamName.value).id;
}

async function addNewSession() {
  loading.value = true;
  if (duration.value === "" || game.value === "") {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddSession.errors.fill_all_fields"),
      life: 3000,
    });
    loading.value = false;
    return;
  }
  if (duration.value[0] === "=") {
    duration.value = duration.value.replace(/\s+/g, "");
    let operandes = duration.value.slice(1).split("+");
    duration.value = 0;
    for (let operand of operandes) {
      if (!regex.test(operand)) {
        toast.add({
          severity: "error",
          summary: "",
          detail: i18n.t("AddSession.errors.formulas_error"),
          life: 3000,
        });
        loading.value = false;
        duration.value = "";
        return;
      }
      duration.value += parseInt(operand);
    }
  } else if (!regex.test(duration.value || !game.value)) {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddSession.errors.fill_all_fields"),
      life: 3000,
    });
    loading.value = false;
    return;
  }
  let success = false;
  if (props.addToWaitingList) {
    storeWaitingList.addSession({
      teamId: getTeamId(),
      gameName: game.value,
      duration: parseInt(duration.value),
      was_cool: was_cool.value.value,
      platform: selected_platform.value.id,
      comment: comment.value,
      date: new Date()
    });
    success = true;
  } else {
    if (!navigator.onLine) {
      success = false;
    } else {
      success = await addSession(
          getTeamId(),
          game.value,
          parseInt(duration.value),
          was_cool.value.value,
          comment.value,
          selected_platform.value.id
      );
    }
  }

  loading.value = false;
  if (success) {
    icon.value = "pi pi-check";
    toast.add({
      severity: "success",
      summary: "",
      detail: i18n.t("AddSession.all_good"),
      life: 3000,
    });
    if (getPreferences("reload_data_after_adding_session") && !props.addToWaitingList) {
      setTimeout(async () => {
        await store.reloadStore();
      }, 3000);
    }
  } else {
    if (!props.addToWaitingList) {
      storeWaitingList.addSession({
        teamId: getTeamId(),
        gameName: game.value,
        duration: parseInt(duration.value),
        was_cool: was_cool.value.value,
        platform: selected_platform.value.id,
        comment: comment.value,
        date: new Date()
      });
      toast.add({
        severity: "error",
        summary: "",
        detail: i18n.t("AddSession.errors.unexpected_error"),
        life: 3000,
      });
      toast.add({
        severity: "error",
        summary: "",
        detail: i18n.t("AddSession.errors.adding_to_waiting_list"),
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "",
        detail: i18n.t("AddSession.errors.unexpected_error"),
        life: 3000,
      });
    }
  }
  game.value = "";
  duration.value = "";
}
</script>
<style scoped>
.as-background {
  background-image: v-bind(heroe_url);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 500px;
  width: 750px;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.as-container {
  width: 90%;
  height: 90%;
  border-radius: 30px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  display: grid;
  grid-template-columns: 170px 1fr;
}

.as-game-image {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.as-img-game-image {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 190px;
  width: 143px;
  border-radius: 15px;
  border: 1px solid white;
}

.as-button-add {
  grid-column: 1 / span 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.as-select-platform {
  grid-column: 1 / span 2;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.btn-add {
  width: 95%;
}

.as-input {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.as-comments {
  margin-top: 10px;
}

.as-duration-input {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.input-number {
  margin-right: 10px;
  width: 200px;
}

.as-fun-selector {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 92%;
  background-color: whitesmoke;
  border-radius: 10px;
  padding: 5px;
  margin-top: 10px;
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
