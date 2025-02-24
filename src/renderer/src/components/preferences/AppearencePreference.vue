<script setup>
import { ref, watch } from "vue";
import { getPreferences, setPreferences } from "../../preferences/preferences";

const use_logo_color_in_team_list = ref(
  getPreferences("use_logo_color_in_team_list"),
);
watch(use_logo_color_in_team_list, () => {
  setPreferences(
    "use_logo_color_in_team_list",
    use_logo_color_in_team_list.value,
  );
});

const use_logo_color_in_session_history = ref(
  getPreferences("use_logo_color_in_session_history"),
);
watch(use_logo_color_in_session_history, () => {
  setPreferences(
    "use_logo_color_in_session_history",
    use_logo_color_in_session_history.value,
  );
});

const selected_accent_color = ref(getPreferences("accent_color"));
watch(selected_accent_color, () => {
  setPreferences("accent_color", selected_accent_color.value);
  changeTheme();
});

const possible_colors = {};

function changeTheme() {
  const themeLink = document.getElementById("theme-link");
  themeLink.href = `./public/lara-light-${selected_accent_color.value}/theme.css`;
}
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">{{ $t("AppearancePreference.title") }}</h2>
    <div class="tp-item">
      <b class="text-color">{{
        $t("AppearancePreference.use_color_of_most_played_game_in_team_list")
      }}</b>
      <InputSwitch v-model="use_logo_color_in_team_list" />
    </div>
    <div class="tp-item">
      <b class="text-color">{{
        $t("AppearancePreference.use_color_of_game_in_history")
      }}</b>
      <InputSwitch v-model="use_logo_color_in_session_history" />
    </div>
    <div class="tp-item">
      <b class="text-color">{{ $t("AppearancePreference.accent_color") }}</b>
      <Dropdown
        v-model="selected_accent_color"
        :options="possible_colors"
        optionLabel="label"
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
