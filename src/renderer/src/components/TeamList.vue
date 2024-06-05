<template>
  <DataView :value="teamItem" class="dataview">
    <template #list="slotProps">
      <div
        v-for="(item, index) in slotProps.items"
        :key="index"
        :class="getClassNameFromIndex(index)"
        @click="navigateToTeam(item.name)"
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
        <div class="icon-action">
          <i class="pi pi-arrow-right"></i>
        </div>
      </div>
    </template>
  </DataView>
</template>
<script setup>
import { onMounted, ref, watch, onUpdated } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import { getPreferences } from "../preferences/preferences";

const router = useRouter();

const store = useStore();
const { teams, sessions, games } = storeToRefs(store);

onMounted(() => {
  init();
});

onUpdated(() => {});

watch(sessions, () => {
  init();
});

const teamItem = ref([]);

function setTeamItem() {
  teamItem.value = [];

  // calculate gametime and most played game for each team
  const teamData = teams.value.reduce((acc, team) => {
    acc[team.id] = {
      name: team.name,
      playtime: 0,
      gameDurations: {}, // To track duration per game
      logo: "",
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

function getGameById(gameId) {
  let game = games.value.find((g) => g.id === gameId);
  if (game === undefined) return { name: "", heroe: "", logo: "" };
  return { name: game.name, heroe: game.heroe, logo: game.logo };
}

const init = () => {
  setTeamItem();
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

function navigateToTeam(teamName) {
  router.push("/team/" + teamName);
}
</script>
<style scoped>
.dataview {
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
  background-color: var(--primary-300);
  cursor: pointer;
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
