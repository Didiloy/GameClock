<template>
  <div class="container">
    <div class="overlay">
      <h2 class="playtime">{{ convertMinuteToHoursMinute(props.playtime) }}</h2>
      <Image
        :src="props.icon"
        imageClass="img"
        width="50px"
        height="50px"
        imageStyle="border-radius: 10px; margin-right:20px;"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";

const props = defineProps(["gameName", "playtime", "joyRate", "heroe", "icon"]);
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
.container {
  display: flex;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 450px;
  height: 95px !important;
  border-radius: 10px;
  background-image: v-bind(heroe_url);
  background-size: cover;
  background-repeat: no-repeat;
  margin-top: 10px;
}
.overlay {
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: row !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 450px;
  height: 95px !important;
  border-radius: 10px;
}

.playtime {
  color: var(--surface-0);
  margin-left: 20px;
}
</style>
