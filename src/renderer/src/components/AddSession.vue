<template>
  <div class="as-container">
    <div class="as-heroe">
      <img :src="game_grid" alt="game image" class="as-img-game-image" />
    </div>
    <div class="as-heroe-revert"></div>
    <div class="as-on-image">
      <div class="as-top-background">
        <AutoComplete
          v-model="game"
          :placeholder="i18n.t('AddSession.game_name')"
          :suggestions="items"
          @complete="autocomplete"
          :pt="{
            root: {
              style: 'height: 45px; width: 300px',
            },
          }"
        >
        </AutoComplete>
        <Checkbox
          v-model="associate_to_platform"
          inputId="associate_to_platform"
          name="associate_to_platform"
          :binary="true"
          style="font-size: 12px; margin-left: 3px"
          @change="saveAssociation"
        />
        <label
          for="associate_to_platform"
          style="font-size: 12px; margin-left: 3px"
        >
          {{ $t("AddSession.associate_to_platform") }}
        </label>
        <div class="as-duration-input">
          <InputText
            class="input-number"
            v-model="duration"
            :placeholder="i18n.t('AddSession.duration_in_minute')"
            :title="i18n.t('AddSession.informative_text_formulas')"
            :pt="{
              root: {
                style: 'height: 45px; width: 250px',
              },
            }"
          >
          </InputText>
          <div>
            <Button
              icon="pi pi-clock"
              @click="getChronoValue"
              style="background-color: var(--primary-400)"
              class="as-chrono-button"
            />
          </div>
        </div>
      </div>
      <div class="as-bottom-background">
        <div class="as-bottom-background-top">
          <MultiSelect
            v-model="teamName"
            :options="teams"
            filter
            display="chip"
            optionLabel="name"
            :placeholder="i18n.t('AddSession.select_team')"
            class="mb20"
            :pt="{
              root: {
                style: 'width: 100%',
              },
            }"
          />
          <div class="as-fun-selector mb20">
            <ToggleButton
              v-model="toggle_fun"
              :onLabel="i18n.t('AddSession.fun')"
              :offLabel="i18n.t('AddSession.fun')"
              class="toggle-button"
              :pt="{
                box: {
                  style: toggle_fun
                    ? 'background-color: var(&#45;&#45;green-400);'
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
                    ? 'background-color: var(&#45;&#45;yellow-400);'
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
                    ? 'background-color: var(&#45;&#45;red-400);'
                    : 'background-color: whitesmoke; border: none;',
                },
              }"
            />
          </div>
          <SelectButton
            v-model="selected_platform"
            :options="platforms_options"
            optionLabel="name"
            dataKey="id"
            class="mb20"
            :pt="{
              root: {
                style: 'width: 100%; padding-left: 2px;',
              },
              button: {
                style: 'height: 40px; width: 116px;',
              },
            }"
          >
          </SelectButton>
          <TextArea
            v-model="comment"
            rows="1"
            style="width: 100%"
            class="mb20"
            :placeholder="i18n.t('AddSession.comments')"
          />
        </div>

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
  <Toast />
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useStore, useStoreChrono, useStoreWaitingList } from "../store/store";
import { storeToRefs } from "pinia";
import { addSession } from "../database/database";
import { getPreferences, setPreferences } from "../preferences/preferences";
import gameNotFound from "../assets/images/game_not_found.jpg";

import { useI18n } from "vue-i18n";

const i18n = useI18n();

const storeWaitingList = useStoreWaitingList();

const emit = defineEmits(["toggleChronoListener"]);
const storeChrono = useStoreChrono();
const { chrono_value } = storeToRefs(storeChrono);
const store = useStore();
const { games, teams, platforms } = storeToRefs(store);
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

const associate_to_platform = ref(false);
const platforms_options = ref([]);

const duration = ref("");
const was_cool = ref({});
const options_cool = ref([
  { name: "Bien", value: true },
  { name: "Neutre", value: undefined },
  { name: "Nul", value: false },
]);
const toggle_fun = ref(false);
const toggle_neutre = ref(false);
const toggle_nul = ref(false);

function saveAssociation() {
  let games_associations = getPreferences("associate_to_platform");
  if (associate_to_platform.value) {
    games_associations.push({
      name: game.value,
      platform: selected_platform.value.id,
    });
    setPreferences("associate_to_platform", games_associations);
  } else {
    games_associations = games_associations.filter(
      (obj) => obj.name !== game.value,
    );
    setPreferences("associate_to_platform", games_associations);
  }
}

watch(game, () => {
  const games_associations = getPreferences("associate_to_platform");
  if (games_associations.length == 0) return;
  function findPlatformByName(name) {
    const item = games_associations.find((obj) => obj.name === name);
    return item ? item.platform : null;
  }
  const platform = findPlatformByName(game.value);
  if (platform === null) {
    associate_to_platform.value = false;
    return;
  }
  selected_platform.value = platforms.value.filter((p) => p.id === platform)[0];
  associate_to_platform.value = true;
});

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

function getChronoValue() {
  duration.value = chrono_value.value;
}

onMounted(() => {
  emit("toggleChronoListener");
  if (props.gameName) {
    game.value = props.gameName;
  }

  platforms_options.value = platforms.value.map((p) => {
    return { name: i18n.t("Platform." + p.name), id: p.id };
  });

  selected_platform.value = platforms.value.filter(
    (p) => p.name === "Not specified",
  )[0];

  const selected_toggle_by_default = getPreferences(
    "toggle_fun_selected_by_default",
  );
  switch (selected_toggle_by_default) {
    case "-1":
      toggle_nul.value = true;
      break;
    case "0":
      toggle_neutre.value = true;
      break;
    case "1":
      toggle_fun.value = true;
      break;
    default:
      break;
  }
});

onUnmounted(() => {
  emit("toggleChronoListener");
});

const autocomplete = (event) => {
  let tmpArray = all_games.value.filter((item) => {
    return item.name.toLowerCase().includes(event.query.toLowerCase());
  });
  items.value = tmpArray.map((item) => {
    return item.name;
  });
};

const teamName = ref([]);
if (props.teamName) {
  teamName.value = teams.value.filter((t) => t.name === props.teamName);
}

const regex = new RegExp("^[1-9]\\d*$"); //vérifie si le nombre entré ne commence pas par un 0

function getTeamsId() {
  return teamName.value.map((item) => item.id);
}

async function addNewSession() {
  loading.value = true;
  if (
    duration.value === "" ||
    game.value === "" ||
    teamName.value.length === 0
  ) {
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
      teamsId: getTeamsId(),
      gameName: game.value,
      duration: parseInt(duration.value),
      was_cool: was_cool.value.value,
      platform: selected_platform.value.id,
      comment: comment.value,
      date: new Date(),
    });
    success = true;
  } else {
    if (!navigator.onLine) {
      success = false;
    } else {
      success = await addSession(
        getTeamsId(),
        game.value,
        parseInt(duration.value),
        was_cool.value.value,
        comment.value,
        selected_platform.value.id,
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
    if (
      getPreferences("reload_data_after_adding_session") &&
      !props.addToWaitingList
    ) {
      setTimeout(async () => {
        await store.reloadStore();
      }, 3000);
    }
  } else {
    if (!props.addToWaitingList) {
      storeWaitingList.addSession({
        teamId: getTeamsId(),
        gameName: game.value,
        duration: parseInt(duration.value),
        was_cool: was_cool.value.value,
        platform: selected_platform.value.id,
        comment: comment.value,
        date: new Date(),
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
  resetForm();
}

function resetForm() {
  game.value = "";
  duration.value = "";
  comment.value = "";
  toggle_fun.value = false;
  toggle_neutre.value = false;
  toggle_nul.value = false;
  selected_platform.value = platforms.value.filter(
    (p) => p.name === "Not specified",
  )[0];
}
</script>
<style scoped>
.as-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
}

.as-heroe {
  height: 300px;
  width: 100%;
  margin: 0;
  padding: 0;
  background-image: v-bind(heroe_url);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  z-index: 0;
}

.as-img-game-image {
  position: absolute;
  left: 35px;
  top: 13px;
  z-index: 2;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 160px;
  width: 120px;
  border-radius: 15px;
  border: 1px solid black;
}

.as-heroe-revert {
  height: 300px;
  width: 100%;
  margin: 0;
  padding: 0;
  background-image: v-bind(heroe_url);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  transform: scaleY(-1);
  position: relative;
  z-index: 0;
}

.as-on-image {
  position: absolute;
  height: 400px;
  width: 100%;
  left: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

.as-top-background {
  height: 75px;
  width: 100%;
  background-color: rgba(209, 224, 253, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
}

.as-duration-input {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.as-bottom-background {
  height: 325px;
  width: 100%;
  background-color: rgba(170, 201, 250, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px 50px;
}

.as-bottom-background-top {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

.mb20 {
  margin-bottom: 20px;
}

.as-fun-selector {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: whitesmoke;
  border-radius: 10px;
  padding: 0px;
}

.btn-add {
  width: 100%;
}

.as-input {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.input-number {
  margin-right: 10px;
  width: 200px;
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
</style>
