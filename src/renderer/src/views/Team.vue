<template>
  <div class="t-container">
    <div class="t-top-row">
      <Button
        :label="i18n.t('Team.new_session')"
        icon="pi pi-plus"
        @click="toggleAddSession"
        v-if="id_of_team.length === 1"
      ></Button>
      <div class="t-title">
        <h2 v-if="id_of_team.length === 1" class="team-name">
          {{ $route.params.name }}
        </h2>
        <h2 v-else class="team-name" :title="$route.params.name">
          {{ id_of_team.length + " " + i18n.t("Sidebar.teams.label") }}
        </h2>
      </div>
      <Dropdown v-model="selected_success" :options="unlocked_successes">
        <template #value="slotProps">
          <div
            v-if="slotProps.value"
            :title="slotProps.value.description"
            style="
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
            "
          >
            <img :src="slotProps.value.image" style="width: 20px" />
          </div>
        </template>
        <template #option="slotProps">
          <div
            :title="slotProps.option.description"
            style="
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
            "
          >
            <img :src="slotProps.option.image" style="width: 30px" />
          </div>
        </template>
      </Dropdown>
      <Dropdown
        v-model="selected_month"
        :options="labels_dropdown"
        optionLabel="label"
      />
    </div>
    <Dialog
      v-model:visible="add_session_dialog_visible"
      modal
      dismissableMask
      closeOnEscape
      :closable="false"
      :showHeader="false"
      :pt="{
        content: {
          style:
            'height: 600px; width: 800px; border-radius: 15px; margin: 0; padding: 0;',
        },
      }"
    >
      <AddSession
        :teamName="$route.params.name"
        :gameName="add_session_game_name"
        @toggleChronoListener="toggleChronoListener"
      ></AddSession>
    </Dialog>
    <DashboardTeam
      :teamName="$route.params.name"
      :sessions="selected_month.game_sessions"
    ></DashboardTeam>
  </div>
</template>

<script setup>
import AddSession from "../components/AddSession.vue";
import DashboardTeam from "../components/DashboardTeam.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { getPreferences } from "../preferences/preferences";
import { useRoute } from "vue-router";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { getIdsOfTeam } from "../database/database";
import { useSuccesses } from "../composables/successes";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const store = useStore();
const { sessions, teams } = storeToRefs(store);

const game_if_we_come_from_home = useRoute().params.game;
const add_session_game_name = ref("");
const add_session_dialog_visible = ref(false);

const id_of_team = ref([]);

const emit = defineEmits(["toggleChronoListener"]);

const sessions_of_team = ref([]);
function getSessionsOfTeam() {
  let sessions_of_team = [];
  for (let sess of sessions.value) {
    if (sess.teams.some((team) => id_of_team.value.includes(team))) {
      sessions_of_team.push(sess);
    }
  }

  return sessions_of_team;
}

const month_year = ref([]);
function createMonthYearArray() {
  let tmp_games = sessions_of_team.value.sort((a, b) => {
    return b.date.seconds - a.date.seconds;
  });
  let games_by_year_months = [];
  for (let g of tmp_games) {
    if (games_by_year_months.length === 0) {
      games_by_year_months.push({
        year: g.date.toDate().getFullYear(),
        months: [{ month: g.date.toDate().getMonth(), games: [g] }],
      });
    } else {
      let year_exist = false;
      for (let y of games_by_year_months) {
        if (y.year === g.date.toDate().getFullYear()) {
          year_exist = true;
          let month_exist = false;
          for (let m of y.months) {
            if (m.month === g.date.toDate().getMonth()) {
              month_exist = true;
              m.games.push(g);
            }
          }
          if (!month_exist) {
            y.months.push({ month: g.date.toDate().getMonth(), games: [g] });
          }
        }
      }
      if (!year_exist) {
        games_by_year_months.push({
          year: g.date.toDate().getFullYear(),
          months: [{ month: g.date.toDate().getMonth(), games: [g] }],
        });
      }
    }
  }
  return games_by_year_months.sort((a, b) => {
    return a.year - b.year;
  });
}

const labels_dropdown = ref([]);
function setLabelsDropdown() {
  labels_dropdown.value.push({
    label: i18n.t("Team.all_time"),
    game_sessions: sessions_of_team.value,
  });
  for (let year of month_year.value) {
    for (let month of year.months) {
      labels_dropdown.value.push({
        label: i18n.t("Common.months_names." + month.month) + " " + year.year,
        game_sessions: month.games,
      });
    }
  }
}

const selected_month = ref({});

function toggleAddSession() {
  add_session_dialog_visible.value = !add_session_dialog_visible.value;
}

function toggleChronoListener() {
  emit("toggleChronoListener");
}

function keyEventAddSession(e) {
  if (
    e.key === getPreferences("add_session_key_shortcut").toLowerCase() ||
    e.key === getPreferences("add_session_key_shortcut").toUpperCase()
  ) {
    if (!add_session_dialog_visible.value) {
      add_session_game_name.value = "";
      toggleAddSession();
    }
  }
  if (
    e.key ===
      getPreferences("add_session_with_name_key_shortcut_1").toLowerCase() ||
    e.key ===
      getPreferences("add_session_with_name_key_shortcut_1").toUpperCase()
  ) {
    if (!add_session_dialog_visible.value) {
      add_session_game_name.value = getPreferences(
        "add_session_with_name_game_name_1",
      );
      toggleAddSession();
    }
  }
  if (
    e.key ===
      getPreferences("add_session_with_name_key_shortcut_2").toLowerCase() ||
    e.key ===
      getPreferences("add_session_with_name_key_shortcut_2").toUpperCase()
  ) {
    if (!add_session_dialog_visible.value) {
      add_session_game_name.value = getPreferences(
        "add_session_with_name_game_name_2",
      );
      toggleAddSession();
    }
  }
}

const unlocked_successes = ref([]);
const selected_success = ref();

onMounted(() => {
  id_of_team.value = getIdsOfTeam(useRoute().params.name, teams.value);
  sessions_of_team.value = getSessionsOfTeam();
  month_year.value = createMonthYearArray();
  setLabelsDropdown();
  selected_month.value = labels_dropdown.value[0];

  document.addEventListener("keyup", keyEventAddSession);
  if (game_if_we_come_from_home) {
    add_session_game_name.value = game_if_we_come_from_home;
    toggleAddSession();
  }
  //successes
  const {
    calculateSuccesses,
    relentless,
    patient,
    enduring,
    inexhaustible,
    young_gamer,
    gamer,
    passionnate,
    curious,
    prospector,
    scholar,
    depressed,
    important_person,
    thousand_hours,
    stinky,
    why_playing,
  } = useSuccesses(i18n);
  calculateSuccesses(useRoute().params.name, sessions_of_team.value, false);
  let unlocked = [];
  unlocked.push(relentless.value);
  unlocked.push(patient.value);
  unlocked.push(enduring.value);
  unlocked.push(inexhaustible.value);
  unlocked.push(young_gamer.value);
  unlocked.push(gamer.value);
  unlocked.push(passionnate.value);
  unlocked.push(curious.value);
  unlocked.push(prospector.value);
  unlocked.push(scholar.value);
  unlocked.push(depressed.value);
  unlocked.push(important_person.value);
  unlocked.push(thousand_hours.value);
  unlocked.push(stinky.value);
  unlocked.push(why_playing.value);
  unlocked_successes.value = unlocked.filter((s) => s.unlocked);
  selected_success.value = unlocked_successes.value[0];
});

onUnmounted(() => {
  document.removeEventListener("keyup", keyEventAddSession);
});
</script>
<style scoped>
.t-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  margin-bottom: 25px;
}

.t-top-row {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: start;
  width: 100%;
}

.t-title {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

.team-name {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>
