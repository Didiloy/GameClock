<template>
  <div class="dt-container">

    <div class="dt-dashboard">
      <LittleCard
          class="dt-lc-total-time"
          iconName="pi pi-hourglass"
          backgroundColor="#d4e7dc"
          titleColor="#0f1f18"
          :name="team_time_hours"
          :value="
              'passées à jouer. Soit <b>' +
              percentage_total_time +
              '</b> du temps total de jeu'
            "
      ></LittleCard>
      <LittleCard
          iconName="pi pi-hashtag"
          class="dt-lc-position"
          :name="ranking_computed"
          backgroundColor="#f7d8fe"
          titleColor="#27142f"
          value="position de l'équipe dans le classement par temps de jeu"
      ></LittleCard>
      <GameTimeHome
          class="dt-pie-chart"
          :teamName="props.teamName"
          backgroundColor="#f9e09f"
          titleColor="#241a00"
      ></GameTimeHome>
      <GamesFunPercentage
          class="dt-fun-percentage"
          :teamName="props.teamName"></GamesFunPercentage>
      <BarChartAllGames
          class="dt-bar-chart"
          :teamName="props.teamName"
          backgroundColor="#ffdbcb"
          titleColor="#341100"
      ></BarChartAllGames>
      <LittleCard
          class="dt-lc-book-read"
          iconName="pi pi-book"
          backgroundColor="#c5eae7"
          titleColor="#00201f"
          :name="number_of_books"
          :value="text_book"
      ></LittleCard>
      <TopGamesLittleGameCard :teamName="props.teamName" class="dt-top-card"></TopGamesLittleGameCard>
      <LittleCard
          class="dt-lc-movies"
          iconName="pi pi-youtube"
          :name="number_of_movies"
          backgroundColor="#f9e09f"
          titleColor="#241a00"
          :value="text_movies"
      ></LittleCard>
      <LineChartGameByMonth
          class="dt-line-chart"
          :teamName="props.teamName"
          backgroundColor="#e8defa"
          titleColor="#1e182c"
      ></LineChartGameByMonth>
      <LittleCard
          class="dt-lc-game-number"
          iconName="pi pi-sort-amount-up"
          backgroundColor="#ffdbcb"
          titleColor="#341100"
          :name="number_of_games"
          value="jeux joués"
      ></LittleCard>
      <LittleCard
          class="dt-lc-todo"
          iconName="pi pi-list"
          :name="sessions_number"
          backgroundColor="#dae1ff"
          titleColor="#001849"
          :value="'sessions de jeu'"
      ></LittleCard>

    </div>
      <SessionsHistory :teamName="props.teamName"/>
  </div>
</template>
<script setup>
import LineChartGameByMonth from "./LineChartGameByMonth.vue";
import GameTimeHome from "../components/GameTimeHome.vue";
import LittleCard from "./LittleCard.vue";
import BarChartAllGames from "../components/BarChartAllGames.vue";
import TopGamesLittleGameCard from "./TopGamesLittleGameCard.vue";
import GamesFunPercentage from "./GamesFunPercentage.vue";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {computed, onMounted, ref, watch} from "vue";
import SessionsHistory from "./SessionsHistory.vue";
import {convertMinuteToHoursMinute} from "../common/main";

const props = defineProps(["teamName"]);

const store = useStore();
const {sessions, games, teams} = storeToRefs(store);
const id_of_team = ref("");

onMounted(() => {
  init();
});

watch([sessions, id_of_team], () => {
  init();
});

function init() {
  id_of_team.value = getIdOfTeam();
  total_time.value = calculateTotalTime();
  team_time.value = calculateTeamTime();
  sessions_number.value = getNumberOfSessions();
  ranking.value = calculateRanking(props.teamName);
  number_of_games.value = getNumberOfGames();
}

const sessions_number = ref(0);


function getIdOfTeam(){
  for (let t of teams.value) {
    if (t.name === props.teamName) {
      return t.id;
    }
  }
  return "";
}
function getNumberOfSessions() {
  if (id_of_team.value === "") return 0;
  let cpt = 0;
  sessions.value.forEach((element) => {
    if (element.team.id === id_of_team.value) {
      cpt++;
    }
  });
  return cpt;
}

const total_time = ref(0);
const team_time = ref(0);
const team_time_hours = computed(() => {
  return convertMinuteToHoursMinute(team_time.value);
});
const percentage_total_time = computed(() => {
  return ((team_time.value / total_time.value) * 100).toFixed(2) + "%";
});

const average_book_reading_time = ref(178);
const number_of_books = computed(() => {
  return (team_time.value / average_book_reading_time.value).toFixed(0);
});

const average_movie_time = ref(110);
const number_of_movies = computed(() => {
  return (team_time.value / average_movie_time.value).toFixed(0);
});

function calculateTotalTime() {
  let cpt = 0;
  sessions.value.forEach((element) => {
    cpt += element.duration;
  });
  return cpt;
}

function calculateTeamTime() {
  if (id_of_team.value === "") return 0;
  let cpt = 0;
  sessions.value.forEach((element) => {
    if (element.team.id === id_of_team.value) {
      cpt += element.duration;
    }
  });
  return cpt;
}

const number_of_games = ref(0);

function getNumberOfGames() {
  if (id_of_team.value === "") return 0;
  let cpt = 0;
  let played_games = [];
  sessions.value.forEach((element) => {
    if (element.team.id === id_of_team.value) {
      if (!played_games.includes(element.game.id)) {
        played_games.push(element.game.id);
        cpt++;
      }
    }
  });
  return cpt;
}

const ranking = ref(0);
const ranking_computed = computed(() => {
  return ranking.value;
});

function calculateRanking(teamName) {
  //calculate the playtime of all teams
  let playtime = [];
  for (let t of teams.value) {
    let cpt = 0;
    sessions.value.forEach((element) => {
      if (element.team.id === t.id) {
        cpt += element.duration;
      }
    });
    playtime.push({team: t.name, time: cpt});
  }

  playtime.sort((a, b) => {
    return b.time - a.time;
  });

  let cpt = 1;
  for (let p of playtime) {
    if (p.team === teamName) {
      return cpt;
    }
    cpt++;
  }
  return cpt;
}

const monthNames = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Jui",
  "Aou",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const text_book = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <span>C'est le nombre de <b>livres</b> d'environ 400 pages que vous auriez pu lire pendant ce temps.</span>
          </div>`;
const text_movies = `<div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <span>C'est le nombre de <b>films</b> d'environ 1h50 que vous auriez pu regarder pendant ce temps.</span>
          </div>`;
</script>
<style scoped>
.dt-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 100%;
  width: 98%;
}

.dt-dashboard {
  display: grid;
  column-gap: 10px;
  row-gap: 10px;
  width: 100%;
  height: 100%;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 100px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.dt-lc-total-time {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 7;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dt-lc-position {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 1;
  grid-row-end: 3;
}

.dt-pie-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 7;
  grid-row-start: 3;
  grid-row-end: 7;
}

.dt-fun-percentage {
  width: 100%;
  height: 100%;
  grid-column-start: 7;
  grid-column-end: 13;
  grid-row-start: 3;
  grid-row-end: 7;
}

.dt-bar-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 10;
  grid-row-start: 7;
  grid-row-end: 11;
}

.dt-lc-book-read {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 10;
  grid-column-end: 13;
  grid-row-start: 7;
  grid-row-end: 11;
}

.dt-lc-movies {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 11;
  grid-row-end: 16;
}

.dt-top-card {
  width: 100%;
  height: 100%;
  grid-column-start: 4;
  grid-column-end: 13;
  grid-row-start: 11;
  grid-row-end: 16;
}

.dt-line-chart {
  width: 100%;
  height: 100%;
  grid-column-start: 1;
  grid-column-end: 10;
  grid-row-start: 16;
  grid-row-end: 20;
}

.dt-lc-game-number {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 10;
  grid-column-end: 13;
  grid-row-start: 16;
  grid-row-end: 18;
}

.dt-lc-todo {
  display: inline-grid;
  width: 100%;
  height: 100%;
  grid-column-start: 10;
  grid-column-end: 13;
  grid-row-start: 18;
  grid-row-end: 20;
}
</style>
