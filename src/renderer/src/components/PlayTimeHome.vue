<template>
  <div class="container">
    <Card class="card">
      <template #title> Classement des équipes par temps de jeu </template>
      <template #content>
        <Chart type="bar" :data="chartData" :options="chartOptions" />
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
const total_time = ref(0);
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
  let a = await getFirstTeamsByPlaytime(teams.value.length);
  teams_from_db.value = a;
  total_time.value = await getTotalPlaytime();
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

function calculatePercentage(playtime) {
  return ((playtime / total_time.value) * 100).toFixed(2);
}

function convertMinuteToHoursMinute(minute) {
  return (
    (minute - (minute % 60)) / 60 +
    "h" +
    (minute % 60 == 0 ? "" : (minute % 60) + "min")
  );
}

const setChartData = () => {
  return {
    labels: teams_name.value,
    datasets: [
      {
        label: "Temps de jeu en minute",
        data: teams_playtime.value,
        backgroundColor: [
          "rgba(252, 140, 173, 0.4)",
          "rgba(46, 169, 223, 0.4)",
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
  width: 70vw;
}
</style>
