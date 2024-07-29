<template>
  <div v-if="loading">
    <Loading msg="Chargement des équipes" />
  </div>
  <div v-else class="tl-container">
    <div class="tl-container-buttons">
      <ToggleButton
        v-model="toggle_select_team"
        onLabel="Abandonner"
        offLabel="Sélectionner plusieurs équipes"
      />
      <Button
        label=""
        icon="pi pi-arrow-right"
        :disabled="!toggle_select_team"
        @click="onClickMultipleTeam"
      />
    </div>
    <DataView :value="teamItem" class="dataview">
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
          </div>
          <div class="team-playtime">
            <h4>{{ convertMinuteToHoursMinute(item.playtime) }}</h4>
          </div>
          <div v-if="!toggle_select_team" class="icon-action">
            <i class="pi pi-arrow-right"></i>
          </div>
          <div v-else class="icon-action">
            <Checkbox v-model="item.selected" :binary="true" />
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
import {
  convertMinuteToHoursMinute,
  getMostDominantColor,
} from "../common/main";
import { getPreferences } from "../preferences/preferences";
import Loading from "./Loading.vue";

const router = useRouter();

const store = useStore();
const { teams, sessions, games } = storeToRefs(store);

const loading = ref(true);

const toggle_select_team = ref(false);

onMounted(async () => {
  loading.value = true;
  await init();
  loading.value = false;
  if (getPreferences("use_logo_color_in_team_list")) {
    // await getTeamColor();
    await getTeamColorWithWorker();
  }
});

onUpdated(() => {});

watch(sessions, async () => {
  loading.value = true;
  await init();
  loading.value = false;
  if (getPreferences("use_logo_color_in_team_list")) {
    // await getTeamColor();
    await getTeamColorWithWorker();
  }
});

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

  // // Determine the most played game for each team
  Object.values(teamData).forEach((team) => {
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
  });

  const result = Object.values(teamData);
  teamItem.value = result;
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

async function getTeamColor() {
  for (let r of teamItem.value) {
    r.gradient_color = await getMostDominantColor(r.logo, 0.4);
  }
}

async function getTeamColorWithWorker() {
  for (let team of teamItem.value) {
    const worker = new Worker(
      new URL("../workers/colorWorker.js", import.meta.url)
    );

    worker.onmessage = (event) => {
      const { logo, color, error } = event.data;

      if (error) {
        console.error(`Error processing logo ${logo}: ${error}`);
        return;
      }

      team.gradient_color = color;
    };

    worker.onerror = (error) => {
      console.error(`Worker error: ${error.message}`);
      reject(error);
    };

    worker.postMessage({ logo: team.logo, transparency: 0.4 });
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

.team-item:hover {
  cursor: pointer;
  width: 755px;
  height: 78px;
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
