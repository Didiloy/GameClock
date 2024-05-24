<template>
  <div id="header">
    <div id="drag-region">
      <div id="window-title">
        <img
          src="../assets/images/icons.png"
          draggable="false"
          style="height: 25px; width: auto"
        />
        <!-- <span>GameClock</span> -->
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
import { onMounted } from "vue";

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
  grid-template-columns: auto 138px;
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
