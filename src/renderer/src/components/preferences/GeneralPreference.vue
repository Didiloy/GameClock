<script setup>
import { ref, watch } from "vue";
import { getPreferences, setPreferences } from "../../preferences/preferences";
import { useToast } from "primevue/usetoast";
const toast = useToast();

const toggle_chronometer_key_shortcut = ref(
  getPreferences("toggle_chronometer_key_shortcut")
);

const update_shortcut = (update_value) => {
  if (!validateShortCut(update_value)) return;
  setPreferences("toggle_chronometer_key_shortcut", update_value);
};

function validateShortCut(shortcut) {
  if (shortcut.length > 1) {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Vous ne pouvez mettre qu'une seule lettre",
      life: 3000,
    });
    return false;
  }
  if (!isValidChar(shortcut)) {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Vous ne pouvez mettre que des lettres",
      life: 3000,
    });
    return false;
  }
  return true;
}

function isValidChar(character) {
  return /[a-z]|[A-Z]|^$/.test(character);
}
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">Général</h2>
    <div class="tp-item">
      <b class="text-color"
        >Raccourci clavier pour lancer/stopper le chronomètre:</b
      >
      <InputText
        type="text"
        :modelValue="toggle_chronometer_key_shortcut"
        @update:modelValue="update_shortcut"
        style="width: 50px"
        maxlength="1"
      />
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
