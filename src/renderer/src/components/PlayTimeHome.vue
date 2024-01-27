<template>
  <div class="container">
    <Card class="card">
      <template #subtitle> Classement des équipes par temps de jeu </template>
      <template #content>
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :pt="{
            canvas: {
              class: 'p-chart',
              style: 'height: 100%; width: auto;',
            },
          }"
        />
      </template>
    </Card>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import {
  getFirstTeamsByPlaytime,
  getTotalPlaytime,
} from "../database/database.js";

onMounted(() => {
  init();
});

const store = useStore();
const { teams } = storeToRefs(store);
const teams_from_db = ref([]);
const teams_name = computed(() => {
  let arr = [];
  teams_from_db.value.map((team) => arr.push(team.name));
  return arr;
});
const teams_playtime = computed(() => {
  let arr = [];
  teams_from_db.value.map((team) => arr.push(team.playtime));
  return arr;
});

const chartData = ref({});
const chartOptions = ref();

async function init() {
  teams_from_db.value = await getFirstTeamsByPlaytime(teams.value.length);
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);
  return {
    labels: teams_name.value,
    datasets: [
      {
        label: "Temps de jeu en minute",
        data: teams_playtime.value,
        backgroundColor: [
          documentStyle.getPropertyValue("--indigo-500"),
          documentStyle.getPropertyValue("--cyan-500"),
          documentStyle.getPropertyValue("--pink-500"),
          documentStyle.getPropertyValue("--teal-500"),
          documentStyle.getPropertyValue("--blue-500"),
          documentStyle.getPropertyValue("--bluegray-500"),
          documentStyle.getPropertyValue("--yellow-500"),
          documentStyle.getPropertyValue("--green-500"),
          documentStyle.getPropertyValue("--red-500"),
          documentStyle.getPropertyValue("--orange-500"),
          documentStyle.getPropertyValue("--purple-500"),
        ],
        borderWidth: 1,
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
  const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

  return {
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
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
