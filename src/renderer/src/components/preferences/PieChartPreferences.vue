<script setup>
import {ref, watch} from "vue";
import {getPreferences, setPreferences} from "../../preferences/preferences";

const checked = ref(getPreferences("pie_chart_labels_shown"));
watch(checked, () => {
  setPreferences("pie_chart_labels_shown", checked.value);
});

const use_random_generated_color = ref(getPreferences("pie_chart_use_custom_colors"));
watch(use_random_generated_color, () => {
  setPreferences("pie_chart_use_custom_colors", use_random_generated_color.value);
});
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">Graphique camembert</h2>
    <div class="tp-item">
      <b class="text-color">Montrer la légende par défaut:</b>
      <InputSwitch v-model="checked" />
    </div>
    <div class="tp-item">
      <b class="text-color">Utiliser des couleurs générées aléatoirement:</b>
      <InputSwitch v-model="use_random_generated_color" />
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
  padding-left: 10px;
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

.tp-item-right-container {
  display: flex;
  justify-content: end;
  align-items: center;
}
</style>