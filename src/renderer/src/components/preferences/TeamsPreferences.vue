<script setup>
import { ref, watch } from "vue";
import {getPreferences, setPreferences} from "../../preferences/preferences";

const sort_order_options = ref([
    "playtime",
    "name",
    "game"
]);
const sort_order = ref(getPreferences("sort_order_team_list"));

watch(sort_order, () => {
    setPreferences("sort_order_team_list", sort_order.value);
});
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">Équipes</h2>
    <div class="tp-item">
      <b class="text-color">Ordre de tri de la liste des équipes:</b>
      <Dropdown v-model="sort_order" :options="sort_order_options" />
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
}
</style>