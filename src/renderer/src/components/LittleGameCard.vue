<template>
  <div class="container-card">
    <div class="overlay">
      <div class="time-logo">
        <h1 class="playtime">
          {{ convertMinuteToHoursMinute(props.playtime) }}
        </h1>
        <img :src="props.icon" class="img" />
      </div>
      <div class="joyrate">
        <div class="good"></div>
        <div class="bad"></div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";

const props = defineProps(["gameName", "playtime", "joyRate", "heroe", "icon"]);
const joyrate_bad = computed(() => {
  return 100 - props.joyRate + "%";
});
const joyrate_good = computed(() => {
  return props.joyRate + "%";
});

const heroe_url = computed(() => {
  return "url(" + props.heroe + ")";
});

function convertMinuteToHoursMinute(minute) {
  return (
    (minute - (minute % 60)) / 60 + "H" + (minute % 60 == 0 ? "" : minute % 60)
  );
}
</script>
<style scoped>
.container-card {
  display: grid;
  grid-template-columns: auto !important;
  width: 450px;
  height: 95px !important;
  border-radius: 10px;
  background-image: v-bind(heroe_url);
  background-size: cover;
  background-repeat: no-repeat;
  margin-top: 10px;
}

.overlay {
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column !important;
  justify-content: start !important;
  align-items: center !important;
  width: 450px;
  height: 95px !important;
  border-radius: 10px;
}

.time-logo {
  display: flex;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 450px;
  height: 85px !important;
  border-radius: 10px;
}
.img {
  border-radius: 10px;
  margin-right: 20px !important;
  max-width: 80px;
  max-height: 80px;
  width: auto;
  height: auto;
}

.joyrate {
  display: flex;
  flex-direction: row !important;
  justify-content: center !important;
  align-items: center !important;
  height: 5px;
  width: 100%;
  border-radius: 10px;
  padding-bottom: 2px;
}

.good {
  background-color: green;
  width: v-bind(joyrate_good);
  height: 100%;
  border-radius: 10px;
}

.bad {
  background-color: red;
  width: v-bind(joyrate_bad);
  height: 100%;
  border-radius: 10px;
}

.playtime {
  color: var(--surface-0);
  margin-left: 30px !important;
  font-size: 50px;
}
</style>
