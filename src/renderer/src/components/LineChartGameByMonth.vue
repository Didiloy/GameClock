<template>
  <div class="container">
    <Card class="card">
      <template #subtitle> Temps de jeu et de bonheur par mois</template>
      <template #content>
        <Chart
          type="line"
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
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const props = defineProps(["teamName"]);
onMounted(() => {
  init();
});

const store = useStore();
const { sessions, teams } = storeToRefs(store);

const sessions_of_the_team = ref([]);
function setSessionsOfTheTeam() {
  for (let s of sessions.value) {
    if (s.team.id == id_of_team.value) {
      sessions_of_the_team.value.push(s);
    }
  }
}

const id_of_team = ref("");
function setIdOfTeam() {
  for (let t of teams.value) {
    if (t.name == props.teamName) {
      id_of_team.value = t.id;
    }
  }
}

const game_duration_by_month = ref([]);
function setGameDuration() {
  for (let s of sessions_of_the_team.value) {
    let date = new Date(s.date.seconds * 1000);
    let month = date.getMonth();
    if (game_duration_by_month.value[month]) {
      game_duration_by_month.value[month] += s.duration;
    } else {
      game_duration_by_month.value[month] = s.duration;
    }
  }
}

const joyrate_by_month = ref([]);
function setJoyrate() {
  let joyrate_number = [];
  for (let s of sessions_of_the_team.value) {
    let date = new Date(s.date.seconds * 1000);
    let month = date.getMonth();
    if (joyrate_by_month.value[month]) {
      joyrate_by_month.value[month] += s.was_cool ? 1 : 0;
      joyrate_number[month] = joyrate_number[month]
        ? joyrate_number[month] + 1
        : 1;
    } else {
      joyrate_by_month.value[month] = s.was_cool ? 1 : 0;
      joyrate_number[month] = joyrate_number[month]
        ? joyrate_number[month] + 1
        : 1;
    }
  }
  for (let i = 0; i < joyrate_by_month.value.length; i++) {
    joyrate_by_month.value[i] =
      (joyrate_by_month.value[i] / joyrate_number[i]) * 100;
  }
}

const chartData = ref({});
const chartOptions = ref();

async function init() {
  setIdOfTeam();
  setSessionsOfTheTeam();
  setGameDuration();
  setJoyrate();
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

watch(teams, () => {
  init();
});

watch(sessions, () => {
  init();
});

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: [
      "Janvier",
      "Fevrier",
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
    ].slice(0, game_duration_by_month.value.length),
    datasets: [
      {
        label: "Temps de jeu total",
        data: game_duration_by_month.value,
        fill: false,
        borderColor: documentStyle.getPropertyValue("--cyan-500"),
        tension: 0.4,
      },
      {
        label: "Plaisir à jouer (%)",
        data: joyrate_by_month.value,
        fill: false,
        borderColor: documentStyle.getPropertyValue("--gray-500"),
        tension: 0.4,
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
    maintainAspectRatio: false,
    aspectRatio: 0.6,
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
