<template>
  <div class="t-container">
    <div class="t-top-row">
      <Button
        label="Nouvelle session"
        icon="pi pi-plus"
        @click="toggleAddSession"
      ></Button>
      <div class="t-title">
        <h2 class="team-name">{{ $route.params.name }}</h2>
      </div>
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
      header="Ajouter une session"
      :style="{ width: '600px' }"
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
import { onMounted, onUnmounted, ref, defineEmits } from "vue";
import { getPreferences } from "../preferences/preferences";
import { useRoute } from "vue-router";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { getIdOfTeam } from "../database/database";

const store = useStore();
const { sessions, games, teams } = storeToRefs(store);

const game_if_we_come_from_home = useRoute().params.game;
const add_session_game_name = ref("");
const add_session_dialog_visible = ref(false);

const id_of_team = ref("");

const emit = defineEmits(["toggleChronoListener"]);

const sessions_of_team = ref([]);
function getSessionsOfTeam() {
  return sessions.value.filter((s) => s.team.id === id_of_team.value);
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
    label: "Toutes périodes",
    game_sessions: sessions_of_team.value,
  });
  for (let year of month_year.value) {
    for (let month of year.months) {
      labels_dropdown.value.push({
        label: months[month.month] + " " + year.year,
        game_sessions: month.games,
      });
    }
  }
}

const selected_month = ref({});

const months = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

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
        "add_session_with_name_game_name_1"
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
        "add_session_with_name_game_name_2"
      );
      toggleAddSession();
    }
  }
}

onMounted(() => {
  id_of_team.value = getIdOfTeam(useRoute().params.name, teams.value);
  sessions_of_team.value = getSessionsOfTeam();
  month_year.value = createMonthYearArray();
  setLabelsDropdown();
  selected_month.value = labels_dropdown.value[0];

  document.addEventListener("keyup", keyEventAddSession);
  if (game_if_we_come_from_home) {
    add_session_game_name.value = game_if_we_come_from_home;
    toggleAddSession();
  }
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
