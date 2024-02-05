<template>
  <div class="container">
    <Card class="card">
      <template #subtitle> Informations des jeux </template>
      <template #content>
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :pt="{
            canvas: {
              class: 'p-chart',
              style: 'height: 100%; width: auto',
            },
          }"
        />
      </template>
    </Card>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const props = defineProps(["teamName"]);
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);
onMounted(() => {
  init();
});

watch([games, sessions, teams], () => {
  init();
});

const games_names = ref([]);
const getGamesNames = () => {
  let res = [];
  games.value.map((g) =>
    res.push(g.name.length > 10 ? g.name.slice(0, 10) + "..." : g.name)
  );
  return res;
};
const sessions_number = ref([]);
const getSessionNumber = () => {
  let res = [];
  for (let g of games.value) {
    let acc = 0;
    if (props.teamName) {
      for (let s of sessions.value) {
        if (s.game.id == g.id && s.team.id == id_of_team.value) {
          acc += 1;
        }
      }
    } else {
      for (let s of sessions.value) {
        if (s.game.id == g.id) {
          acc += 1;
        }
      }
    }
    res.push(acc);
  }
  return res;
};

const id_of_team = ref("");
function setIdOfTeam() {
  for (let t of teams.value) {
    if (t.name == props.teamName) {
      id_of_team.value = t.id;
    }
  }
}

const avg_duration = ref([]);
const getAverageDuration = () => {
  let res = [];
  for (let g of games.value) {
    let acc = 0;
    let ss_num = 0;
    if (props.teamName) {
      for (let s of sessions.value) {
        if (s.game.id == g.id && s.team.id == id_of_team.value) {
          acc += s.duration;
          ss_num++;
        }
      }
    } else {
      for (let s of sessions.value) {
        if (s.game.id == g.id) {
          acc += s.duration;
          ss_num++;
        }
      }
    }
    res.push(acc / ss_num);
  }
  return res;
};

const cool_percentage = ref([]);
const getCoolPercentage = () => {
  let res = [];
  for (let g of games.value) {
    let acc = 0;
    let ss_num = 0;
    if (props.teamName) {
      for (let s of sessions.value) {
        if (s.game.id == g.id && s.team.id == id_of_team.value) {
          acc += s.was_cool ? 1 : 0;
          ss_num++;
        }
      }
    } else {
      for (let s of sessions.value) {
        if (s.game.id == g.id) {
          acc += s.was_cool ? 1 : 0;
          ss_num++;
        }
      }
    }
    res.push((acc / ss_num) * 100);
  }
  return res;
};

const chartData = ref({});
const chartOptions = ref();

function init() {
  setIdOfTeam();
  games_names.value = getGamesNames();
  sessions_number.value = getSessionNumber();
  avg_duration.value = getAverageDuration();
  cool_percentage.value = getCoolPercentage();
  for (let i = games_names.value.length; i >= 0; i--) {
    if (sessions_number.value[i] == 0) {
      games_names.value.splice(i, 1);
      sessions_number.value.splice(i, 1);
      avg_duration.value.splice(i, 1);
      cool_percentage.value.splice(i, 1);
    }
  }
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--text-color");

  return {
    labels: games_names.value,
    datasets: [
      {
        label: "Nombre de sessions",
        borderColor: documentStyle.getPropertyValue("--blue-500"),
        pointBackgroundColor: documentStyle.getPropertyValue("--blue-500"),
        pointBorderColor: documentStyle.getPropertyValue("--blue-500"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--blue-500"),
        data: sessions_number.value,
        backgroundColor: documentStyle.getPropertyValue("--blue-500"),
      },
      {
        label: "Temps moyen d'une session",
        borderColor: documentStyle.getPropertyValue("--pink-400"),
        pointBackgroundColor: documentStyle.getPropertyValue("--pink-400"),
        pointBorderColor: documentStyle.getPropertyValue("--pink-400"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--pink-400"),
        data: avg_duration.value,
        backgroundColor: documentStyle.getPropertyValue("--pink-500"),
      },
      {
        label: "Plaisir à jouer en(%)",
        borderColor: documentStyle.getPropertyValue("--orange-400"),
        pointBackgroundColor: documentStyle.getPropertyValue("--orange-400"),
        pointBorderColor: documentStyle.getPropertyValue("--orange-400"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--orange-400"),
        data: cool_percentage.value,
        backgroundColor: documentStyle.getPropertyValue("--orange-500"),
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--text-color");
  const textColorSecondary = documentStyle.getPropertyValue(
    "--text-color-secondary"
  );

  return {
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      r: {
        grid: {
          color: textColorSecondary,
        },
      },
    },
  };
};
</script>
<style scoped>
.card {
  background-color: var(--primary-100);
  width: 100%;
  height: 100%;
}

.p-chart {
  max-height: 100%;
}
</style>
