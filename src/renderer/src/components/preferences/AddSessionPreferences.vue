<script setup>
import {onMounted, ref, watch} from "vue";
import {getPreferences, setPreferences} from "../../preferences/preferences";
import {useToast} from "primevue/usetoast";
import {useStore} from "../../store/store";
import {storeToRefs} from "pinia";

const store = useStore();
const {games, teams} = storeToRefs(store);
const toast = useToast();

const shortcut_add_session = ref(getPreferences("add_session_key_shortcut"));
const update_shortcut_without_name = (update_value) => {
  if (!validateShortCut(update_value)) return;
  setPreferences("add_session_key_shortcut", update_value);
};

function validateShortCut(shortcut) {
  if (shortcut.length > 1) {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Vous ne pouvez mettre qu'une seule lettre",
      life: 3000,
    });
    return false;
  }
  if (!isValidChar(shortcut)) {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Vous ne pouvez mettre que des lettres",
      life: 3000,
    });
    return false;
  }
  return true;
}

function isValidChar(character) {
  return /[a-z]|[A-Z]|^$/.test(character);
}

const game_list = ref([]);
const teams_list = ref([]);
onMounted(() => {
  game_list.value = games.value.map(g => g.name);
  game_list.value.unshift("");
  teams_list.value = teams.value.map(t => t.name);
  teams_list.value.unshift("");
});

const first_game = ref(getPreferences("add_session_with_name_game_name_1"));
watch(first_game, () => {
  setPreferences("add_session_with_name_game_name_1", first_game.value);
});
const shortcut_add_session_with_name_1 = ref(getPreferences("add_session_with_name_key_shortcut_1"));
const update_shortcut_with_name_1 = (update_value) => {
  if (!validateShortCut(update_value)) return;
  setPreferences("add_session_with_name_key_shortcut_1", update_value);
};

const second_game = ref(getPreferences("add_session_with_name_game_name_2"));
watch(second_game, () => {
  setPreferences("add_session_with_name_game_name_2", second_game.value);
});
const shortcut_add_session_with_name_2 = ref(getPreferences("add_session_with_name_key_shortcut_2"));
const update_shortcut_with_name_2 = (update_value) => {
  if (!validateShortCut(update_value)) return;
  setPreferences("add_session_with_name_key_shortcut_2", update_value);
};

const reload_data = ref(getPreferences("reload_data_after_adding_session"));
watch(reload_data, () => {
  setPreferences("reload_data_after_adding_session", reload_data.value);
});

const shortcut_add_session_from_homepage_key_shortcut = ref(getPreferences("add_session_from_homepage_key_shortcut"));
const update_shortcut_add_session_from_homepage = (update_value) => {
  if (!validateShortCut(update_value)) return;
  setPreferences("add_session_from_homepage_key_shortcut", update_value);
};

const add_session_from_homepage_game_name = ref(getPreferences("add_session_from_homepage_game_name"));
watch(add_session_from_homepage_game_name, () => {
  setPreferences("add_session_from_homepage_game_name", add_session_from_homepage_game_name.value);
});

const add_session_from_homepage_team_name = ref(getPreferences("add_session_from_homepage_team_name"));
watch(add_session_from_homepage_team_name, () => {
  setPreferences("add_session_from_homepage_team_name", add_session_from_homepage_team_name.value);
});
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">Ajouter une session</h2>
    <h4 class="tp-title">Sur la page d'équipe</h4>
    <div class="tp-item">
      <b class="text-color">Raccourci clavier pour ajouter une session sans nom de jeu:</b>
      <InputText type="text" :modelValue="shortcut_add_session" @update:modelValue="update_shortcut_without_name"
                 style="width: 50px" maxlength="1"
      />
    </div>

    <div class="tp-item">
      <b class="text-color">Raccourci clavier pour ajouter une session avec un nom de jeu 1:</b>
      <div class="tp-item-right-container">
        <Dropdown v-model="first_game" :options="game_list" style="margin-right: 10px"/>
        <InputText type="text" :modelValue="shortcut_add_session_with_name_1"
                   @update:modelValue="update_shortcut_with_name_1"
                   style="width: 50px" maxlength="1"
        />
      </div>
    </div>

    <div class="tp-item">
      <b class="text-color">Raccourci clavier pour ajouter une session avec un nom de jeu 2:</b>
      <div class="tp-item-right-container">
        <Dropdown v-model="second_game" :options="game_list" style="margin-right: 10px"/>
        <InputText type="text" :modelValue="shortcut_add_session_with_name_2"
                   @update:modelValue="update_shortcut_with_name_2"
                   style="width: 50px" maxlength="1"
        />
      </div>
    </div>

    <div class="tp-item">
      <b class="text-color">Recharger les données après l'ajout d'une session:</b>
      <InputSwitch v-model="reload_data"/>
    </div>
    <h4 class="tp-title">Sur la page d'accueil</h4>
    <div class="tp-item">
      <b class="text-color">Raccourci clavier pour ajouter une session dans une équipe:</b>
      <div class="tp-item-right-container">
        <Dropdown v-model="add_session_from_homepage_team_name" :options="teams_list" style="width: 150px; margin-right: 10px"/>
        <Dropdown v-model="add_session_from_homepage_game_name" :options="game_list" style="width: 200px; margin-right: 10px"/>
        <InputText type="text" :modelValue="shortcut_add_session_from_homepage_key_shortcut"
                   @update:modelValue="update_shortcut_add_session_from_homepage"
                   style="width: 50px" maxlength="1"
        />
      </div>
    </div>
    <Toast/>
  </div>
</template>

<style scoped>
.tp-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  padding-left: 10px;
  margin-bottom: 10px;
}

.text-color {
  color: var(--text-color);
}

.tp-title {
  color: var(--primary-500);
}

.tp-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tp-item-right-container {
  display: flex;
  justify-content: end;
  align-items: center;
}
</style>