<template>
  <Card
    class="card"
    :pt="{
      content: { style: 'height:100%; ' },
    }"
  >
    <template #subtitle> Classement des jeux en pourcentage </template>
    <template #content>
      <div class="center-pie">
        <Chart
          type="pie"
          :data="chartData"
          :options="chartOptions"
          class="pie"
          :pt="{
            canvas: {
              class: 'p-chart',
              style: 'height: auto; margin-top:10px;',
            },
          }"
        />
      </div>
    </template>
  </Card>
</template>
<script setup>
import { ref, onMounted, watch, reactive } from "vue";
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

const id_of_team = ref("");
function setIdOfTeam() {
  for (let t of teams.value) {
    if (t.name == props.teamName) {
      id_of_team.value = t.id;
    }
  }
}

const games_name = ref([]);

const games_playtime = ref([]);

const games_percentage = ref([]);

function setGamesNameAndPlaytime() {
  let temp_games = [];
  let total_playtime = 0;
  if (id_of_team.value) {
    for (let g of games.value) {
      let acc = 0;
      for (let s of sessions.value) {
        if (s.team.id == id_of_team.value && s.game.id == g.id) {
          acc += s.duration;
          total_playtime += s.duration;
        }
      }
      temp_games.push({ name: g.name, playtime: acc });
    }
  } else {
    for (let g of games.value) {
      let acc = 0;
      for (let s of sessions.value) {
        if (s.game.id == g.id) {
          acc += s.duration;
          total_playtime += s.duration;
        }
      }
      temp_games.push({ name: g.name, playtime: acc });
    }
  }
  temp_games.sort((a, b) => b.playtime - a.playtime);
  temp_games = temp_games.filter((g) => g.playtime > 0);
  games_name.value = temp_games.map((g) => g.name);
  games_percentage.value = temp_games.map((g) =>
    ((g.playtime / total_playtime) * 100).toFixed(0)
  );
  games_playtime.value = temp_games.map((g) => g.playtime);
}

const chartData = ref({});
const chartOptions = ref();

async function init() {
  setIdOfTeam();
  setGamesNameAndPlaytime();
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

function convertMinuteToHoursMinute(minute) {
  return (
    (minute - (minute % 60)) / 60 +
    "h" +
    (minute % 60 == 0
      ? ""
      : minute % 60 > 10
        ? minute % 60
        : "0" + (minute % 60))
  );
}

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);

  return {
    labels: games_name.value,
    datasets: [
      {
        data: games_playtime.value,
        backgroundColor: [
          documentStyle.getPropertyValue("--blue-500"),
          documentStyle.getPropertyValue("--yellow-500"),
          documentStyle.getPropertyValue("--green-500"),
          documentStyle.getPropertyValue("--red-500"),
          documentStyle.getPropertyValue("--orange-500"),
          documentStyle.getPropertyValue("--purple-500"),
          documentStyle.getPropertyValue("--pink-500"),
          documentStyle.getPropertyValue("--teal-500"),
          documentStyle.getPropertyValue("--cyan-500"),
          documentStyle.getPropertyValue("--indigo-500"),
          documentStyle.getPropertyValue("--bluegray-500"),
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue("--blue-400"),
          documentStyle.getPropertyValue("--yellow-400"),
          documentStyle.getPropertyValue("--green-400"),
          documentStyle.getPropertyValue("--red-400"),
          documentStyle.getPropertyValue("--orange-400"),
          documentStyle.getPropertyValue("--purple-400"),
          documentStyle.getPropertyValue("--pink-400"),
          documentStyle.getPropertyValue("--teal-400"),
          documentStyle.getPropertyValue("--cyan-400"),
          documentStyle.getPropertyValue("--indigo-400"),
          documentStyle.getPropertyValue("--bluegray-400"),
        ],
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--text-color");

  return {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return (
              convertMinuteToHoursMinute(
                games_playtime.value[context.dataIndex]
              ) +
              " -> " +
              games_percentage.value[context.dataIndex] +
              "%"
            );
          },
        },
      },
      legend: {
        labels: {
          usePointStyle: true,
          color: textColor,
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
  height: 100%;
}

.center-pie {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
