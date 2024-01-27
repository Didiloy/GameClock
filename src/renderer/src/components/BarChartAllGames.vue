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
              style: 'height: 100%;',
            },
          }"
        />
      </template>
    </Card>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import {
  getGameSessionsNumber,
  getGameAvgDuration,
  getGameCoolPercentage,
} from "../database/database.js";

onMounted(() => {
  init();
});

const store = useStore();
const { games } = storeToRefs(store);

const games_names = computed(() => {
  let res = [];
  games.value.map((g) => res.push(g.name));
  return res;
});
const sessions_number = ref([]);
const getSessionNumber = async () => {
  let res = [];
  for (let g of games.value) {
    res.push(await getGameSessionsNumber(g.name));
  }
  return res;
};

const avg_duration = ref([]);
const getAverageDuration = async () => {
  let res = [];
  for (let g of games.value) {
    res.push(await getGameAvgDuration(g.name));
  }
  return res;
};

const cool_percentage = ref([]);
const getCoolPercentage = async () => {
  let res = [];
  for (let g of games.value) {
    res.push(await getGameCoolPercentage(g.name));
  }
  return res;
};

watch(games, () => {
  init();
});

const chartData = ref({});
const chartOptions = ref();

async function init() {
  sessions_number.value = await getSessionNumber();
  avg_duration.value = await getAverageDuration();
  cool_percentage.value = await getCoolPercentage();
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
        label: "Plaisir a jouer en(%)",
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
