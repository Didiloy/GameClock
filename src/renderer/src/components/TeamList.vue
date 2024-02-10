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
import {ref, onMounted, watch} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { getSumSessionsDurationAndMostPlayedLogo } from "../database/database";
const router = useRouter();

const store = useStore();
const { teams, sessions } = storeToRefs(store);

onMounted(() => {
  init();
});

watch(sessions, () => {
  init();
});


const teamItem = ref([]);

const init = async () => {
  teams.value.forEach(async (v) => {
    let playtime = await getSumSessionsDurationAndMostPlayedLogo(v.name);
    teamItem.value.push({
      name: v.name,
      playtime: playtime.duration,
      logo: playtime.logo,
    });
  });
};

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
  /* round only the bottom */
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
