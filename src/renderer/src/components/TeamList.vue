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
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";

const router = useRouter();

const store = useStore();
const {teams, sessions, games} = storeToRefs(store);

onMounted(() => {
  init();
});

watch(sessions, () => {
  init();
});


const teamItem = ref([]);

function setTeamItem() {
  teamItem.value = [];
  for (let t of teams.value) {
    teamItem.value.push({
      name: t.name,
      playtime: getPlaytime(t.id),
      logo: getMostPlayedLogo(t.id),
    });
  }
}

function getMostPlayedLogo(teamId) {
  let temp_games = [];
  let total_playtime = 0;
  for (let g of games.value) {
    let acc = 0;
    for (let s of sessions.value) {
      if (s.team.id === teamId && s.game.id === g.id) {
        acc += s.duration;
        total_playtime += s.duration;
      }
    }
    temp_games.push({name: g.name, playtime: acc, logo: g.logo});
  }
  temp_games.sort((a, b) => b.playtime - a.playtime);
  temp_games = temp_games.filter((g) => g.playtime > 0);
  return temp_games[0]?.logo ? temp_games[0].logo : '';
}

function getPlaytime(teamId) {
  let playtime = 0;
  for (let s of sessions.value) {
    if (s.team.id === teamId) {
      playtime += s.duration;
    }
  }
  return playtime;
}

const init = async () => {
  setTeamItem();
};

function convertMinuteToHoursMinute(minute) {
  return (
      ((minute - (minute % 60)) / 60 > 0
          ? (minute - (minute % 60)) / 60 + "h "
          : "") +
      (minute % 60 === 0
          ? ""
          : minute % 60 >= 10
              ? (minute % 60) + "m"
              : "0" + (minute % 60) + "m")
  );
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

function navigateToTeam(teamName) {
  router.push("/team/" + teamName);
}
</script>
<style scoped>
.dataview {
  margin-top: 20px;
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
