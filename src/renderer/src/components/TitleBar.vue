<template>
  <div id="header">
    <div id="drag-region">
      <div id="window-title">
        <img
          :src="icon"
          draggable="false"
          style="height: 23px; width: auto"
          alt="logo"
        />
      </div>
      <div class="container-center">
        <div
          v-if="currentRouteName === 'settings-games'"
          class="centered-search"
        >
          <InputText
            type="text"
            v-model="searchStore.searchValue"
            :placeholder="$t('GamesSettings.search_game')"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
          />
        </div>
        <div v-if="currentRouteName === 'teams'" class="centered-search">
          <InputText
            type="text"
            v-model="searchTeamStore.searchTeamValue"
            :placeholder="$t('Teams.search_team')"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
          />
        </div>
        <div
          v-if="currentRouteName === 'search-sessions'"
          class="centered-search"
        >
          <InputText
            type="text"
            v-model="searchSessionStore.searchSessionsValue"
            :placeholder="$t('SearchSessions.title')"
            @focus="emit('toggleChronoListener')"
            @blur="emit('toggleChronoListener')"
          />
        </div>
        <div v-if="currentRouteName === 'home'" class="centered-title">
          <span class="h-span">{{ total_time_hours.toUpperCase() }}</span>
          <span class="h-subtitle">{{
            $t("Dashboard.spent_playing").toUpperCase()
          }}</span>
        </div>
      </div>
      <div
        id="chronometer"
        @contextmenu="pauseChrono"
        @click="startStopWatch"
        :style="'background-color:' + background_color + ';'"
        class="hover-div"
      >
        <div class="popup">
          {{
            $t("TitleBar.last_chronometer_value") +
            convertSecondsToHourMinutesSeconds(last_chrono_value)
          }}
        </div>
        <span v-if="duration_seconds !== 0">
          {{ convertSecondsToHourMinutesSeconds(duration_seconds) }}
        </span>
        <i class="pi pi-stop-circle" v-if="is_chrono_running"></i>
        <i class="pi pi-clock" v-else></i>
      </div>
      <div id="window-controls">
        <div class="button" id="min-button">
          <img
            class="icon"
            src="../assets/images/minimize_icon.svg"
            draggable="false"
            alt="minimize"
          />
        </div>

        <div class="button" id="max-button">
          <img
            class="icon-max"
            src="../assets/images/maximize_icon.svg"
            draggable="false"
            alt="maximize"
          />
        </div>

        <div class="button" id="close-button">
          <img
            class="icon"
            src="../assets/images/close_icon.svg"
            draggable="false"
            alt="close"
          />
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useStoreChrono } from "../store/store";
import { getPreferences, setPreferences } from "../preferences/preferences";
import { isChristmas, isHalloween } from "../common/date";
import ChristmasIcon from "../assets/images/icons/christmas_icon.svg";
import HalloweenIcon from "../assets/images/icons/halloween_icon.svg";
import BaseIcon from "../assets/images/icons/base_icon.png";
import { useRoute } from "vue-router";
import InputText from "primevue/inputtext";
import {
  useSearchStore,
  useSearchTeamStore,
  useSearchSessionsStore,
} from "../store/store";
import { useTotalTime } from "../composables/total_time";
const { total_time_hours, calculateTotalTime } = useTotalTime();
import { useToast } from "primevue/usetoast";
const toast = useToast();
import { useI18n } from "vue-i18n";
const i18n = useI18n();

const icon = ref(BaseIcon);

const props = defineProps(["toggleChrono", "data_loaded"]);
const store = useStoreChrono();
const route = useRoute();
const currentRouteName = ref("");
const searchStore = useSearchStore();
const searchTeamStore = useSearchTeamStore();
const searchSessionStore = useSearchSessionsStore();

const emit = defineEmits(["toggleChronoListener"]);

function handleWindowControls() {
  // Make minimise/maximise/close buttons work when they are clicked
  document.getElementById("min-button").addEventListener("click", () => {
    window.electron.ipcRenderer.send("minimize");
  });

  document.getElementById("max-button").addEventListener("click", () => {
    window.electron.ipcRenderer.send("maximize");
  });

  document.getElementById("close-button").addEventListener("click", () => {
    window.electron.ipcRenderer.send("close");
  });
}

onMounted(() => {
  handleWindowControls();
  initializeIcon();
});

function initializeIcon() {
  if (isHalloween()) {
    icon.value = HalloweenIcon;
  } else if (isChristmas()) {
    icon.value = ChristmasIcon;
  }
}

const timestamp_start_chrono = ref(0);
const duration = ref(0);
const duration_seconds = ref(0);
const is_chrono_running = ref(false);
const background_color = ref("var(--primary-500)");
const last_chrono_value = ref(getPreferences("last_chronometer_value"));
const twelve_hours_in_second = 12 * 60 * 60;
let take_a_break_not_shown = true;

setInterval(() => {
  if (is_chrono_running.value) {
    duration_seconds.value =
      (Date.now() - timestamp_start_chrono.value) / 1000 +
      chrono_before_pause.value;
    if (
      duration_seconds.value > twelve_hours_in_second &&
      take_a_break_not_shown
    ) {
      toast.add({
        severity: "info",
        summary: "",
        detail: i18n.t("TitleBar.take_a_break"),
      });
      take_a_break_not_shown = false;
    }
  }
}, 1000);

watch(duration_seconds, () => {
  duration.value = Math.floor(duration_seconds.value / 60);
  store.updateChrono(duration.value);
});

watch(
  () => props.toggleChrono,
  () => {
    startStopWatch();
  },
);

function startStopWatch() {
  if (!is_chrono_running.value) {
    startChrono();
  } else {
    stopChrono();
  }
}

function startChrono() {
  timestamp_start_chrono.value = Date.now();
  duration.value = 0;
  duration_seconds.value = 0;
  resetPause();
  is_chrono_running.value = true;
  background_color.value = "var(--red-500)";
}

function stopChrono() {
  is_chrono_running.value = false;
  background_color.value = "var(--primary-500)";
  last_chrono_value.value = duration_seconds.value;
  setPreferences("last_chronometer_value", last_chrono_value.value);
}

const is_chrono_paused = ref(false);
const chrono_before_pause = ref(0);

function pauseChrono() {
  if (is_chrono_paused.value) {
    timestamp_start_chrono.value = Date.now();
    duration_seconds.value = 0;
    is_chrono_running.value = true;
    background_color.value = "var(--red-500)";
    is_chrono_paused.value = false;
  } else {
    is_chrono_running.value = false;
    chrono_before_pause.value = duration_seconds.value;
    background_color.value = "var(--primary-500)";
    is_chrono_paused.value = true;
  }
}

function resetPause() {
  is_chrono_paused.value = false;
  chrono_before_pause.value = 0;
}

function convertSecondsToHourMinutesSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = (seconds % 60).toFixed(0);

  let result = "";

  if (minutes >= 60) {
    result += Math.floor(minutes / 60) + "h ";
    minutes = minutes % 60;
  }

  result += minutes + "m";

  if (remainingSeconds > 0) {
    if (result !== "") {
      result += " ";
    }
    result += remainingSeconds + "s";
  }

  return result;
}

watch(
  () => props.data_loaded,
  (newDataLoaded) => {
    if (newDataLoaded) {
      calculateTotalTime();
    }
  },
);

watch(
  () => route.name,
  (newName) => {
    currentRouteName.value = newName;
    if (newName === "home") {
      calculateTotalTime();
    }
  },
  { immediate: true },
);
</script>
<style scoped>
#header {
  display: block;
  position: fixed;
  top: 0;
  height: 32px;
  width: 100%;
  /*Compensate for body 1px border*/
  background: var(--primary-100);
  margin: 0;
  padding: 0;
  -webkit-user-select: none;
  user-select: none;
  z-index: 1;
}

#header #drag-region {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-app-region: drag;
  display: grid;
  grid-template-columns: 150px auto 130px 138px;
}

#window-title {
  grid-column: 1;
  display: flex;
  align-items: center;
  margin-left: 8px;
  overflow: hidden;
  font-family: "Segoe UI", sans-serif;
  font-size: 15px;
}

#window-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

#chronometer {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  -webkit-app-region: no-drag;
  border-radius: 10px;
  margin: 4px;
}

#window-controls {
  display: grid;
  grid-template-columns: repeat(3, 46px);
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
}

#window-controls .button {
  grid-row: 1 / span 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

#min-button {
  grid-column: 1;
}

#max-button {
  grid-column: 2;
}

#close-button {
  grid-column: 3;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-max {
  width: 16px;
  height: 16px;
}

#window-controls {
  -webkit-app-region: no-drag;
}

#window-controls .button {
  user-select: none;
}

#window-controls .button:hover {
  background: var(--primary-200);
}

#window-controls .button:active {
  background: var(--primary-300);
}

#close-button:hover {
  background: #e81123 !important;
}

#close-button:active {
  background: #f1707a !important;
}

#close-button:hover .icon {
  filter: invert(1);
}

.hover-div {
  cursor: pointer;
}

.hover-div .popup {
  visibility: hidden;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 5px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: -120%;
  /* Position the popup beside the div */
  opacity: 0;
  transition: opacity 0.3s;
}

.hover-div:hover .popup {
  visibility: visible;
  opacity: 1;
  position: absolute;
  top: 30px;
  height: fit-content;
}

.popup::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.container-center {
  height: 32px;
}

.centered-search {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.centered-search :deep(.p-inputtext) {
  -webkit-app-region: no-drag;
  width: 80%;
  max-width: 100%;
  height: 20px;
}

.centered-title {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
}

.h-span {
  font-size: 25px;
  font-family: dishcek, serif;
  color: #5a5d9d;
  font-weight: bold;
  margin-top: 5px;
}

.h-subtitle {
  font-size: 25px;
  font-family: dishcek, serif;
  color: #5a5d9d;
  margin-top: 5px;
  margin-left: 10px;
}
</style>
