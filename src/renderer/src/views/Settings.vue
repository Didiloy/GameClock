<script setup>
import TeamsPreferences from "../components/preferences/TeamsPreferences.vue";
import AddSessionPreferences from "../components/preferences/AddSessionPreferences.vue";
import AppearencePreference from "../components/preferences/AppearencePreference.vue";
import GeneralPreference from "../components/preferences/GeneralPreference.vue";
import PieChartPreferences from "../components/preferences/PieChartPreferences.vue";
import UserSelection from "../components/preferences/UserSelection.vue";
const emit = defineEmits(["toggleChronoListener"]);

function toggleChronoListener() {
  emit("toggleChronoListener");
}
</script>

<template>
  <div class="s-container">
    <h2 class="s-title">{{ $t("Settings.title") }}</h2>
    <UserSelection />
    <Divider />
    <GeneralPreference @toggleChronoListener="toggleChronoListener" />
    <Divider />
    <TeamsPreferences />
    <Divider />
    <AddSessionPreferences />
    <Divider />
    <AppearencePreference />
    <Divider />
    <PieChartPreferences />
  </div>
</template>

<style scoped>
.s-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  width: 95%;
  margin-bottom: 10px;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

.s-title {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>
