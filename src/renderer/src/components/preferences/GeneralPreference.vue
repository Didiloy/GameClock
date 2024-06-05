<script setup>
import { ref, watch, onMounted, defineEmits } from "vue";
import { getPreferences, setPreferences } from "../../preferences/preferences";
import { useStore } from "../../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { teams } = storeToRefs(store);
import { useToast } from "primevue/usetoast";
const toast = useToast();

const emit = defineEmits(["toggleChronoListener"]);

onMounted(() => {
  addTeamsToPageList();
});

function addTeamsToPageList() {
  for (const t of teams.value) {
    pages_list.value.push({
      label: t.name,
      route: `/team/${t.name}`,
    });
  }
}

const toggle_chronometer_key_shortcut = ref(
  getPreferences("toggle_chronometer_key_shortcut")
);

const selected_page = ref({
  label: getPreferences("default_start_page"),
  route: getPreferences("default_start_page_route"),
});
const pages_list = ref([
  {
    label: "Accueil",
    route: "/",
  },
  {
    label: "Liste des équipes",
    route: "/teams",
  },

  {
    label: "Jeux",
    route: "/settings/games",
  },
  {
    label: "Général",
    route: "/settings/general",
  },
]);

const number_of_last_session_possible = ref(["5", "10", "15"]);
const selected_number_of_last_sessions = ref(
  getPreferences("number_of_last_sessions")
);

watch(selected_number_of_last_sessions, () => {
  setPreferences(
    "number_of_last_sessions",
    selected_number_of_last_sessions.value
  );
});

watch(selected_page, () => {
  setPreferences("default_start_page", selected_page.value.label);
  setPreferences("default_start_page_route", selected_page.value.route);
});

const update_shortcut = (update_value) => {
  emit("toggleChronoListener");
  if (!validateShortCut(update_value)) return;
  setPreferences("toggle_chronometer_key_shortcut", update_value);
  if (update_value === "") {
    emit("toggleChronoListener");
    return;
  }
  setTimeout(function () {
    emit("toggleChronoListener");
  }, 1000);
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
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">Général</h2>
    <div class="tp-item">
      <b class="text-color"
        >Raccourci clavier pour lancer/stopper le chronomètre:</b
      >
      <InputText
        type="text"
        :modelValue="toggle_chronometer_key_shortcut"
        @update:modelValue="update_shortcut"
        style="width: 50px"
        maxlength="1"
      />
    </div>
    <div class="tp-item">
      <b class="text-color">Page dans laquelle démarrer l'application:</b>
      <Dropdown
        v-model="selected_page"
        :options="pages_list"
        optionLabel="label"
      />
    </div>
    <div class="tp-item">
      <b class="text-color"
        >Nombre de dernières sessions à afficher sur la page d'accueil</b
      >
      <Dropdown
        v-model="selected_number_of_last_sessions"
        :options="number_of_last_session_possible"
      />
    </div>
  </div>
</template>

<style scoped>
.tp-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  padding: 10px;
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
</style>
