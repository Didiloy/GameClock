<template>
  <Card
    class="card"
    :pt="{
      body: { style: 'height:100%; ' },
    }"
  >
    <template #title> Classement des jeux en pourcentage </template>
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
              style: 'height: 280px;',
            },
          }"
        />
      </div>
    </template>
  </Card>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { getFirstGamesByPlaytime } from "../database/database.js";

onMounted(() => {
  init();
});

const store = useStore();
const { games } = storeToRefs(store);
const games_from_db = ref([]);
const games_name = computed(() => {
  let arr = [];
  games_from_db.value.map((game) => arr.push(game.name));
  return arr;
});
const games_playtime = computed(() => {
  let arr = [];
  games_from_db.value.map((game) => arr.push(game.playtime));
  return arr;
});

const chartData = ref({});
const chartOptions = ref();

async function init() {
  games_from_db.value = await getFirstGamesByPlaytime(games.value.length);
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
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
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue("--blue-400"),
          documentStyle.getPropertyValue("--yellow-400"),
          documentStyle.getPropertyValue("--green-400"),
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
}

.p-chart {
  max-height: 100%;
}

.center-pie {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style>
