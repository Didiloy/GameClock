<script setup>
import { onMounted, ref, watch } from "vue";
import { getPreferences, setPreferences } from "../../preferences/preferences";
import { useStore } from "../../store/store";
import { storeToRefs } from "pinia";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

const store = useStore();
const { teams } = storeToRefs(store);

const toast = useToast();

const i18n = useI18n();

const emit = defineEmits(["toggleChronoListener"]);

onMounted(() => {
  addTeamsToPageList();
});

const pages_list = ref([
  {
    label: i18n.t("GeneralPreference.pages_list.home"),
    route: "/",
  },
  {
    label: i18n.t("GeneralPreference.pages_list.teams_list"),
    route: "/teams",
  },

  {
    label: i18n.t("GeneralPreference.pages_list.games"),
    route: "/settings/games",
  },
  {
    label: i18n.t("GeneralPreference.pages_list.general"),
    route: "/settings/general",
  },
]);

function addTeamsToPageList() {
  for (const t of teams.value) {
    pages_list.value.push({
      label: t.name,
      route: `/team/${t.name}`,
    });
  }
}

const selected_page = ref({
  label: getPreferences("default_start_page"),
  route: getPreferences("default_start_page_route"),
});

const toggle_chronometer_key_shortcut = ref(
  getPreferences("toggle_chronometer_key_shortcut"),
);

const reload_data_key_shortcut = ref(
  getPreferences("reload_data_key_shortcut"),
);

const number_of_last_session_possible = ref([
  {
    label: "5",
    value: "5",
  },
  {
    label: "10",
    value: "10",
  },
  {
    label: "15",
    value: "15",
  },
  {
    label: i18n.t("GeneralPreference.all_sessions_of_the_day"),
    value: "-1",
  },
  {
    label: i18n.t("GeneralPreference.all_sessions_of_the_week"),
    value: "-2",
  },
]);
const selected_number_of_last_sessions = ref({
  label: number_of_last_session_possible.value.find(
    (e) => e.value === getPreferences("number_of_last_sessions"),
  ).label,
  value: getPreferences("number_of_last_sessions"),
});

watch(selected_number_of_last_sessions, () => {
  setPreferences(
    "number_of_last_sessions",
    selected_number_of_last_sessions.value.value,
  );
});

watch(selected_page, () => {
  setPreferences("default_start_page", selected_page.value.label);
  setPreferences("default_start_page_route", selected_page.value.route);
});

//update the shortcut, emit the event to stop listening to the event while we are changing the key
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

//update the shortcut, emit the event to stop listening to the event while we are changing the key
const update_shortcut_reload_data = (update_value) => {
  emit("toggleChronoListener");
  if (!validateShortCut(update_value)) return;
  setPreferences("reload_data_key_shortcut", update_value);
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
      detail: i18n.t("GeneralPreference.errors.invalid_shortcut"),
      life: 3000,
    });
    return false;
  }
  if (!isValidChar(shortcut)) {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("GeneralPreference.errors.invalid_shortcut"),
      life: 3000,
    });
    return false;
  }
  return true;
}

function isValidChar(character) {
  return /[a-z]|[A-Z]|^$/.test(character);
}

//Language
watch(i18n.locale, () => {
  setPreferences("language", i18n.locale.value);
});
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">{{ $t("GeneralPreference.title") }}</h2>
    <div class="tp-item">
      <b class="text-color">{{ $t("GeneralPreference.select_language") }}</b>
      <Dropdown v-model="$i18n.locale" :options="$i18n.availableLocales" />
    </div>
    <div class="tp-item">
      <b class="text-color">{{
        $t("GeneralPreference.shortcut_toggle_chronometer")
      }}</b>
      <InputText
        type="text"
        :modelValue="toggle_chronometer_key_shortcut"
        @update:modelValue="update_shortcut"
        style="width: 50px"
        maxlength="1"
      />
    </div>
    <div class="tp-item">
      <b class="text-color">{{
        $t("GeneralPreference.shortcut_reload_data")
      }}</b>
      <InputText
        type="text"
        :modelValue="reload_data_key_shortcut"
        @update:modelValue="update_shortcut_reload_data"
        style="width: 50px"
        maxlength="1"
      />
    </div>
    <div class="tp-item">
      <b class="text-color">{{
        $t("GeneralPreference.page_start_application")
      }}</b>
      <Dropdown
        v-model="selected_page"
        :options="pages_list"
        optionLabel="label"
      />
    </div>
    <div class="tp-item">
      <b class="text-color">{{
        $t("GeneralPreference.number_of_last_session")
      }}</b>
      <Dropdown
        v-model="selected_number_of_last_sessions"
        :options="number_of_last_session_possible"
        optionLabel="label"
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
