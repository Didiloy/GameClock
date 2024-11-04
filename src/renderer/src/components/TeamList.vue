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
          :key="index"
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
                v-if="item.relentless.unlocked"
                :src="item.relentless.image"
                :title="item.relentless.description + ''"
                class="success"
              />
              <img
                v-if="item.patient.unlocked"
                :src="item.patient.image"
                :title="item.patient.description + ''"
                class="success"
              />
              <img
                v-if="item.enduring.unlocked"
                :src="item.enduring.image"
                :title="item.enduring.description + ''"
                class="success"
              />
              <img
                v-if="item.inexhaustible.unlocked"
                :src="item.inexhaustible.image"
                :title="item.inexhaustible.description + ''"
                class="success"
              />
              <img
                v-if="item.young_gamer.unlocked"
                :src="item.young_gamer.image"
                :title="item.young_gamer.description + ''"
                class="success"
              />
              <img
                v-if="item.gamer.unlocked"
                :src="item.gamer.image"
                :title="item.gamer.description + ''"
                class="success"
              />
              <img
                v-if="item.passionnate.unlocked"
                :src="item.passionnate.image"
                :title="item.passionnate.description + ''"
                class="success"
              />
              <img
                v-if="item.curious.unlocked"
                :src="item.curious.image"
                :title="item.curious.description + ''"
                class="success"
              />
              <img
                v-if="item.prospector.unlocked"
                :src="item.prospector.image"
                :title="item.prospector.description + ''"
                class="success"
              />
              <img
                v-if="item.scholar.unlocked"
                :src="item.scholar.image"
                :title="item.scholar.description + ''"
                class="success"
              />
              <img
                  v-if="item.thousand_hours.unlocked"
                  :src="item.thousand_hours.image"
                  :title="item.thousand_hours.description + ''"
                  class="success"
              />
              <img
                v-if="item.depressed.unlocked"
                :src="item.depressed.image"
                :title="item.depressed.description + ''"
                class="success"
              />
              <img
                v-if="item.important_person.unlocked"
                :src="item.important_person.image"
                :title="item.important_person.description + ''"
                class="success"
              />
              <img
                  v-if="item.stinky.unlocked"
                  :src="item.stinky.image"
                  :title="item.stinky.description + ''"
                  class="success"
              />
              <img
                  v-if="item.why_playing.unlocked"
                  :src="item.why_playing.image"
                  :title="item.why_playing.description + ''"
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
import { onMounted, ref, watch, onUpdated } from "vue";
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
onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
  if (getPreferences("use_logo_color_in_team_list")) {
    await getTeamColorWithWorker();
  }
});

watch(sessions, async () => {
  loading.value = true;
  await init();
  loading.value = false;
  if (getPreferences("use_logo_color_in_team_list")) {
    await getTeamColorWithWorker();
  }
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
    teamItemFiltered.value = teamItem.value;
    return;
  }
  teamItemFiltered.value = teamItem.value.filter((t) =>
    t.name
      .toLowerCase()
      .includes(searchTeamStore.searchTeamValue.toLowerCase()),
  );
}

const teamItem = ref([]);

async function setTeamItem() {
  teamItem.value = [];

  // calculate gametime and most played game for each team
  const teamData = teams.value.reduce((acc, team) => {
    acc[team.id] = {
      name: team.name,
      playtime: 0,
      gameDurations: {}, // To track duration per game
      logo: "",
      selected: ref(false),
    };
    return acc;
  }, {});

  sessions.value.forEach((session) => {
    const team = teamData[session.team.id];
    if (team === undefined) return;
    team.playtime += session.duration;

    //if the game entry doesn't exist, create it
    if (!team.gameDurations[session.game.id]) {
      team.gameDurations[session.game.id] = {
        duration: 0,
        logo: getGameById(session.game.id).logo,
      };
    }

    team.gameDurations[session.game.id].duration += session.duration;
  });

  // // Determine the most played game for each team and calculate their successes
  Object.values(teamData).forEach((team) => {
    //most played game
    let maxDuration = 0;
    Object.keys(team.gameDurations).forEach((gameName) => {
      const gameData = team.gameDurations[gameName];
      if (gameData.duration > maxDuration) {
        maxDuration = gameData.duration;
        team.logo = gameData.logo;
        team.game_name = gameName;
      }
    });

    delete team.gameDurations;

    //successes
    if (getPreferences("display_successes_in_team_list")) {
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
        why_playing
      } = useSuccesses();
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
    }
  });

  const result = Object.values(teamData);
  teamItem.value = result;
  teamItemFiltered.value = result;
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

async function getTeamColorWithWorker() {
  let id = 0;
  for (let team of teamItem.value) {
    const worker = new Worker(
      new URL("../workers/colorWorker.js", import.meta.url),
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

    worker.postMessage({ logo: team.logo, transparency: 0.4, id: id });
    id++;
  }
}

function getGameById(gameId) {
  let game = games.value.find((g) => g.id === gameId);
  if (game === undefined) return { name: "", heroe: "", logo: "" };
  return { name: game.name, heroe: game.heroe, logo: game.logo };
}

const init = async () => {
  await setTeamItem();
  sortTeams();
};

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
    teamItem.value[index].selected = !teamItem.value[index].selected;
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
}

.tl-container-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 750px;
}

.dataview {
  width: 750px;
  background-color: var(--primary-100);
}

.team-item {
  width: 750px;
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
