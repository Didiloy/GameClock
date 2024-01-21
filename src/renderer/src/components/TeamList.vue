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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getTeams, getSessions } from "../database/database";
import { getDoc } from "firebase/firestore";

onMounted(() => {
  init();
});

const router = useRouter();

const teams = ref([]);
const sessions = ref([]);
const teamItem = ref([]);

async function updateTeams() {
  let t = await getTeams();
  teams.value = t;
}

async function updateSession() {
  let s = await getSessions();
  sessions.value = s;
}

const init = async () => {
  await updateTeams();
  await updateSession();
  teams.value.forEach(async (v) => {
    let playtime = await calculateTeamPlayTime(v.name);
    teamItem.value.push({ name: v.name, playtime: playtime });
  });
};

async function calculateTeamPlayTime(teamName) {
  let playtime = 0;
  for (const s of sessions.value) {
    let teamDetails = (await getDoc(s.team)).data();
    if (teamDetails == undefined) continue;
    if (teamDetails.name == teamName) {
      playtime += s.duration;
    }
  }
  return playtime;
}

function convertMinuteToHoursMinute(minute) {
  return (minute - (minute % 60)) / 60 + "h" + (minute % 60) + "min";
}

function getClassNameFromIndex(index) {
  if (index == 0) {
    return "team-item rounded-top";
  } else if (index == teamItem.value.length - 1) {
    return "team-item rounded-bottom";
  } else {
    return "team-item team-item-odd";
  }
}

function navigateToTeam(teamName) {
  router.push("/team/" + teamName);
}
</script>
<style scoped>
.dataview {
  margin-top: 70px;
}

.team-item {
  width: 750px;
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
  /* round only the bottom */
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.team-name {
  width: 200px;
  height: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
}

.icon-action {
  width: 50px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  padding: 0px;
}
</style>
