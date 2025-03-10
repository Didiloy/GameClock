<template>
  <div v-if="loading">
    <Loading msg="team_loading" />
  </div>
  <div v-else class="tl-container">
    <div class="tl-container-buttons">
      <ToggleButton
        v-model="toggle_select_team"
        :onLabel="i18n.t('TeamList.abandon')"
        :offLabel="i18n.t('TeamList.select_teams')"
      />
      <Button
        label=""
        icon="pi pi-arrow-right"
        :disabled="!toggle_select_team"
        @click="onClickMultipleTeam"
      />
    </div>
    <DataView :value="teamItemFiltered" class="dataview">
      <template #list="slotProps">
        <div
          v-for="(item, index) in slotProps.items"
          :key="item.id"
          :class="getClassNameFromIndex(index)"
          :style="
            item.gradient_color &&
            'background: linear-gradient(to left, ' +
              item.gradient_color +
              ', var(--primary-100) 70%);'
          "
          @click="onClickHandler(item.name, index)"
        >
          <div class="team-name">
            <img
              :src="item.logo"
              style="max-width: 60px; max-height: 60px; margin-right: 10px"
            />
            <h3>{{ item.name }}</h3>
            <div v-if="getPreferences('display_successes_in_team_list')">
              <img
                v-if="item.computed_successes && item.relentless.unlocked"
                :src="item.relentless.image"
                :title="item.relentless.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.patient.unlocked"
                :src="item.patient.image"
                :title="item.patient.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.enduring.unlocked"
                :src="item.enduring.image"
                :title="item.enduring.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.inexhaustible.unlocked"
                :src="item.inexhaustible.image"
                :title="item.inexhaustible.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.young_gamer.unlocked"
                :src="item.young_gamer.image"
                :title="item.young_gamer.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.gamer.unlocked"
                :src="item.gamer.image"
                :title="item.gamer.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.passionnate.unlocked"
                :src="item.passionnate.image"
                :title="item.passionnate.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.curious.unlocked"
                :src="item.curious.image"
                :title="item.curious.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.prospector.unlocked"
                :src="item.prospector.image"
                :title="item.prospector.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.scholar.unlocked"
                :src="item.scholar.image"
                :title="item.scholar.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.thousand_hours.unlocked"
                :src="item.thousand_hours.image"
                :title="item.thousand_hours.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.depressed.unlocked"
                :src="item.depressed.image"
                :title="item.depressed.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.important_person.unlocked"
                :src="item.important_person.image"
                :title="item.important_person.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.stinky.unlocked"
                :src="item.stinky.image"
                :title="item.stinky.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.why_playing.unlocked"
                :src="item.why_playing.image"
                :title="item.why_playing.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.team_player.unlocked"
                :src="item.team_player.image"
                :title="item.team_player.description + ''"
                class="success"
              />
              <img
                v-if="item.computed_successes && item.shower.unlocked"
                :src="item.shower.image"
                :title="item.shower.description + ''"
                class="success"
              />
            </div>
          </div>
          <div class="team-playtime">
            <h4>{{ convertMinuteToHoursMinute(item.playtime) }}</h4>
          </div>
          <div v-if="!toggle_select_team" class="icon-action">
            <i class="pi pi-arrow-right"></i>
          </div>
          <div v-else class="icon-action">
            <Checkbox
              v-model="item.selected"
              :binary="true"
              @click="onClickHandler(item.name, index)"
            />
          </div>
        </div>
      </template>
    </DataView>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import { getPreferences } from "../preferences/preferences";
import { useSearchTeamStore } from "../store/store";
import Loading from "./Loading.vue";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

import { useSuccesses } from "../composables/successes";

const router = useRouter();

const store = useStore();
const { teams, sessions, games } = storeToRefs(store);

const loading = ref(true);

const toggle_select_team = ref(false);
const searchTeamStore = useSearchTeamStore();

const teamItem = ref([]);

onMounted(() => {
  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    id: item.id,
    teams: item.teams.map((team) => team),
    game: { id: item.game.id },
  }));

  const _teams = teams.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const _games = games.value.map((item) => ({
    id: item.id,
    name: item.name,
    logo: item.logo,
    heroe: item.heroe,
  }));

  window.electron.ipcRenderer.send("teamlist", {
    teams: _teams,
    sessions: _sessions,
    games: _games,
  });
});

watch(
  () => searchTeamStore.searchTeamValue,
  () => {
    filterTeam();
  },
);

const teamItemFiltered = ref([]);

function filterTeam() {
  if (searchTeamStore.searchTeamValue === "") {
    teamItemFiltered.value = teamItem.value.map((team) => ({
      id: team.id,
      name: team.name,
      playtime: team.playtime,
      logo: team.logo,
      selected: team.selected,
      game_name: team.game_name,
      gradient_color: team.gradient_color,
      relentless: team.relentless,
      patient: team.patient,
      enduring: team.enduring,
      inexhaustible: team.inexhaustible,
      young_gamer: team.young_gamer,
      gamer: team.gamer,
      passionnate: team.passionnate,
      curious: team.curious,
      prospector: team.prospector,
      scholar: team.scholar,
      depressed: team.depressed,
      important_person: team.important_person,
      thousand_hours: team.thousand_hours,
      stinky: team.stinky,
      why_playing: team.why_playing,
      team_player: team.team_player,
      shower: team.shower,
    }));
    return;
  }
  teamItemFiltered.value = teamItem.value.filter((t) =>
    t.name
      .toLowerCase()
      .includes(searchTeamStore.searchTeamValue.toLowerCase()),
  );
}

window.electron.ipcRenderer.on("result_teamlist", (event, data) => {
  teamItem.value = data.teams;
  teamItemFiltered.value = data.teams;
  loading.value = false;
  sortTeams();
  if (getPreferences("use_logo_color_in_team_list")) {
    setTimeout(() => getTeamColorWithWorker(), 0);
  }
  if (getPreferences("display_successes_in_team_list")) {
    setTimeout(() => getSuccesses(), 0);
  }
});

function getSuccesses() {
  teamItem.value.forEach((team) => {
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
      team_player,
      shower,
    } = useSuccesses(i18n);
    calculateSuccesses(team.name, sessions.value);
    team.relentless = relentless.value;
    team.patient = patient.value;
    team.enduring = enduring.value;
    team.inexhaustible = inexhaustible.value;
    team.young_gamer = young_gamer.value;
    team.gamer = gamer.value;
    team.passionnate = passionnate.value;
    team.curious = curious.value;
    team.prospector = prospector.value;
    team.scholar = scholar.value;
    team.depressed = depressed.value;
    team.important_person = important_person.value;
    team.thousand_hours = thousand_hours.value;
    team.stinky = stinky.value;
    team.why_playing = why_playing.value;
    team.team_player = team_player.value;
    team.shower = shower.value;
    team.computed_successes = true;
  });
}

function sortTeams() {
  switch (getPreferences("sort_order_team_list")) {
    case "playtime":
      teamItem.value.sort((a, b) => b.playtime - a.playtime);
      break;
    case "name":
      teamItem.value.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "game":
      teamItem.value.sort((a, b) => a.game_name.localeCompare(b.game_name));
      break;
  }
}

function getTeamColorWithWorker() {
  let id = 0;
  for (let team of teamItem.value) {
    const worker = new Worker(
      new URL("../workers/colorWorker.js", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event) => {
      const { logo, color, error } = event.data;

      if (error) {
        console.error(`Error processing logo ${logo}: ${error}`);
        worker.terminate();
        return;
      }

      team.gradient_color = color;
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.error(`Worker error: ${error.message}`);
      worker.terminate();
    };

    worker.postMessage({ logo: team.logo, id: id });
    id++;
  }
}

function getClassNameFromIndex(index) {
  if (index === 0) {
    return "team-item rounded-top";
  } else if (index === teamItem.value.length - 1) {
    return "team-item rounded-bottom";
  } else {
    return "team-item";
  }
}

function onClickMultipleTeam() {
  let selected_teams = teamItem.value.filter((t) => t.selected);
  let team_names = selected_teams.map((t) => t.name);
  router.push("/team/" + team_names.join(","));
}

function onClickHandler(teamName, index) {
  if (toggle_select_team.value) {
    teamItemFiltered.value[index].selected =
      !teamItemFiltered.value[index].selected;
  } else {
    navigateToTeam(teamName);
  }
}

function navigateToTeam(teamName) {
  router.push("/team/" + teamName);
}
</script>
<style scoped>
.tl-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
}

.tl-container-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: max(750px, 90%);
}

.dataview {
  width: max(750px, 90%);
  background-color: var(--primary-100);
}

.team-item {
  width: 100%;
  height: 75px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--primary-100);
  padding-left: 10px;
  padding-right: 10px;
}

.success {
  max-width: 25px;
  max-height: 25px;
  width: 25px;
  height: 25px;
  margin-left: 10px;
}

.team-item:hover {
  cursor: pointer;
  font-size: 15pt;
  color: black;
}

.rounded-top {
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.rounded-bottom {
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.team-name {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
}

h4 {
  width: max-content;
}

.icon-action {
  width: 50px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
