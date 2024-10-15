<script setup>
import { ref, watch } from "vue";
import { getPreferences, setPreferences } from "../../preferences/preferences";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const sort_order_options = ref([
  { name: "playtime", label: i18n.t("TeamsPreferences.sort_order.playtime") },
  { name: "name", label: i18n.t("TeamsPreferences.sort_order.name") },
  { name: "game", label: i18n.t("TeamsPreferences.sort_order.game") },
]);
const sort_order = ref();

sort_order.value = sort_order_options.value.find(
  (option) => option.name === getPreferences("sort_order_team_list")
);

watch(sort_order, () => {
  setPreferences("sort_order_team_list", sort_order.value.name);
});


const display_successes_in_team_list = ref(
  getPreferences("display_successes_in_team_list")
);
watch(display_successes_in_team_list, () => {
  setPreferences(
    "display_successes_in_team_list",
    display_successes_in_team_list.value
  );
});
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">{{ $t("TeamsPreferences.teams") }}</h2>
    <div class="tp-item">
      <b class="text-color">{{ $t("TeamsPreferences.sort_order_label") }}</b>
      <Dropdown
        v-model="sort_order"
        :options="sort_order_options"
        optionLabel="label"
      />
    </div>
    <div class="tp-item" style="margin-top: 10px;">
      <b class="text-color">{{
        $t("TeamsPreferences.display_successes_in_team_list")
      }}</b>
      <InputSwitch v-model="display_successes_in_team_list" />
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
