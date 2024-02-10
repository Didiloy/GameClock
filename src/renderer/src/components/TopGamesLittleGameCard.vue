<script setup>
import LittleGameCard from "./LittleGameCard.vue";
const props = defineProps(["teamName"]);

import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { sessions, games, teams } = storeToRefs(store);

import { computed, ref, onMounted, watch } from "vue";

onMounted(() => {
  init();
});
watch([sessions], () => {
  init();
});

function init() {
  setIdOfTeam();
  setSessionsOfTeam();
  let tmp_games = sessions_of_team.value.sort((a, b) => {
    return b.date.seconds - a.date.seconds;
  });
  games_by_year_months.value = [];
  for(let g of tmp_games){
    if(games_by_year_months.value.length === 0){
      games_by_year_months.value.push({year: g.date.toDate().getFullYear(), months: [{month: g.date.toDate().getMonth(), games: [g]}]});
    } else {
      let year_exist = false;
      for(let y of games_by_year_months.value){
        if(y.year === g.date.toDate().getFullYear()){
          year_exist = true;
          let month_exist = false;
          for(let m of y.months){
            if(m.month === g.date.toDate().getMonth()){
              month_exist = true;
              m.games.push(g);
            }
          }
          if(!month_exist){
            y.months.push({month: g.date.toDate().getMonth(), games: [g]});
          }
        }
      }
      if(!year_exist){
        games_by_year_months.value.push({year: g.date.toDate().getFullYear(), months: [{month: g.date.toDate().getMonth(), games: [g]}]});
      }
    }
  }

  games_by_year_months.value.sort((a, b) => {
    return a.year - b.year;
  });
  for(let g of games_by_year_months.value){
    g.months.sort((a, b) => {
      return a.month - b.month;
    });
  }
}

const id_of_team = ref("");
function setIdOfTeam() {
  for (let t of teams.value) {
    if (t.name === props.teamName) {
      id_of_team.value = t.id;
    }
  }
}

const sessions_of_team = ref([]);
function setSessionsOfTeam() {
  sessions_of_team.value = [];
  if (id_of_team.value) {
    for (let s of sessions.value) {
      if (s.team.id === id_of_team.value) {
        sessions_of_team.value.push(s);
      }
    }
  }
}

const games_by_year_months = ref([]);

function getFirstGamesByPlaytime(number, sessions_array){
  let tmp = [];
  for(let s of sessions_array){
    let exist = false;
    for(let t of tmp){
      if(t.gameid === s.game.id){
        exist = true;
        t.duration += s.duration;
        t.was_cool_number += s.was_cool ? 1 : 0;
        t.total_sessions += 1;
      }
    }
    if(!exist){
      tmp.push({gameid: s.game.id, duration: s.duration, was_cool_number: s.was_cool ? 1 : 0, total_sessions: 1});
    }
  }
  tmp.sort((a, b) => {
    return b.duration - a.duration;
  });
  tmp.map((t) => {
    t.joyrate = (t.was_cool_number / t.total_sessions) * 100;
  });
  return tmp.slice(0, number);
}

function getGameDetailsById(id) {
  for (let g of games.value) {
    if (id === g.id) return [g.name, g.logo, g.heroe];
  }
}

const months_name = [
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
</script>

<template>
  <Card class="dt-card">
    <template #subtitle> Top 3 des jeux les plus joués </template>
    <template #content>
      <TabView :scrollable="true" :activeIndex="games_by_year_months.length - 1">
        <TabPanel v-for="tab in games_by_year_months" :key="tab.year" :header="tab.year">
          <TabView :scrollable="true" :activeIndex="tab.months.length - 1">
          <TabPanel v-for="m in tab.months" :key="m.month" :header="months_name[m.month]">
          <div class="dt-little-game-card">
                    <LittleGameCard
                        v-for="(g, i) in getFirstGamesByPlaytime(3, m.games)"
                        :key="i"
                        :gameName="getGameDetailsById(g.gameid)[0]"
                        :playtime="g.duration"
                        :joyRate="g.joyrate"
                        :heroe="getGameDetailsById(g.gameid)[2]"
                        :icon="getGameDetailsById(g.gameid)[1]"
                    ></LittleGameCard>
          </div>
          </TabPanel>
            </TabView>
        </TabPanel>
      </TabView>

    </template>
  </Card>
</template>

<style scoped>
.dt-card {
  margin-top: 5px;
  width: 100%;
  height: 100%;
  background-color: var(--primary-100);
}

.dt-little-game-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>