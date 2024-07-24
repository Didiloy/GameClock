<script setup>
import {ref, watch} from "vue";
import {getPreferences, setPreferences} from "../../preferences/preferences";

const use_logo_color_in_team_list = ref(getPreferences("use_logo_color_in_team_list"));
watch(use_logo_color_in_team_list, () => {
  setPreferences("use_logo_color_in_team_list", use_logo_color_in_team_list.value);
});

const use_logo_color_in_session_history = ref(getPreferences("use_logo_color_in_session_history"));
watch(use_logo_color_in_session_history, () => {
  setPreferences("use_logo_color_in_session_history", use_logo_color_in_session_history.value);
});
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">Apparence</h2>
    <div class="tp-item">
      <b class="text-color">Utiliser la couleur du logo du jeu le plus joué dans la liste des équipes (ralenti le chargement):</b>
      <InputSwitch v-model="use_logo_color_in_team_list" />
    </div>
    <div class="tp-item">
      <b class="text-color">Utiliser la couleur du logo du jeu dans l'historique des sessions (ralenti le chargement):</b>
      <InputSwitch v-model="use_logo_color_in_session_history" />
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