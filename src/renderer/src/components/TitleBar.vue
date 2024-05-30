<template>
  <div id="header">
    <div id="drag-region">
      <div id="window-title">
        <img
          src="../assets/images/icons.png"
          draggable="false"
          style="height: 25px; width: auto"
        />
      </div>
      <div
        id="chronometer"
        @click="startStopWatch"
        :style="'background-color:' + background_color + ';'"
      >
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
          />
        </div>

        <div class="button" id="max-button">
          <img
            class="icon-max"
            src="../assets/images/maximize_icon.svg"
            draggable="false"
          />
        </div>

        <div class="button" id="close-button">
          <img
            class="icon"
            src="../assets/images/close_icon.svg"
            draggable="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useStoreChrono } from "../store/store";
const props = defineProps(["toggleChrono"]);
const store = useStoreChrono();

function handleWindowControls() {
  // Make minimise/maximise/close buttons work when they are clicked
  document.getElementById("min-button").addEventListener("click", (event) => {
    window.electron.ipcRenderer.send("minimize");
  });

  document.getElementById("max-button").addEventListener("click", (event) => {
    window.electron.ipcRenderer.send("maximize");
  });

  document.getElementById("close-button").addEventListener("click", (event) => {
    window.electron.ipcRenderer.send("close");
  });
}

onMounted(() => {
  handleWindowControls();
});

const timestamp_start_chrono = ref(0);
const duration = ref(0);
const duration_seconds = ref(0);
const is_chrono_running = ref(false);
const background_color = ref("var(--primary-500)");

setInterval(() => {
  if (is_chrono_running.value) {
    duration_seconds.value = (Date.now() - timestamp_start_chrono.value) / 1000;
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
  }
);

function startStopWatch() {
  if (!is_chrono_running.value) {
    timestamp_start_chrono.value = Date.now();
    duration.value = 0;
    is_chrono_running.value = !is_chrono_running.value;
    background_color.value = "var(--red-500)";
  } else {
    is_chrono_running.value = !is_chrono_running.value;
    background_color.value = "var(--primary-500)";
  }
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
</script>
<style scoped>
#header {
  display: block;
  position: fixed;
  top: 0;
  height: 32px;
  width: 100%; /*Compensate for body 1px border*/
  background: var(--primary-100);
  padding: 4px;
  -webkit-user-select: none;
  user-select: none;
  z-index: 1;
}

#header #drag-region {
  width: 100%;
  height: 100%;
  -webkit-app-region: drag;
  display: grid;
  grid-template-columns: auto 130px 138px;
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
#close-button:active .icon {
  filter: invert(1);
}
</style>
