<template>
  <div class="container">
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        body: { style: 'height:100%; width: auto;' },
        content: { style: 'height:100%; width: auto;' },
      }"
    >
      <template #subtitle>
        <span class="lcgm-font"
          >{{ $t("LineChartGameByMonth.title") }}
          <i
            class="pi pi-window-maximize"
            @click="fullscreen = !fullscreen"
          ></i> </span
      ></template>
      <template #content>
        <Chart
          type="line"
          :data="chartData"
          :options="chartOptions"
          :plugins="
            getPreferences('activate_zoom_on_graphs') ? [zoomPlugin] : ''
          "
          :pt="{
            root: { style: 'height: 100%; width: auto' },
            canvas: {
              style: 'height: 100%; width: auto',
            },
          }"
        />
      </template>
    </Card>
    <Dialog
      v-model:visible="fullscreen"
      modal
      dismissableMask
      :header="i18n.t('LineChartGameByMonth.title')"
      :style="{ width: '90%', height: '90%' }"
    >
      <div style="height: 80vh; width: 100%">
        <Chart
          type="line"
          :data="chartData"
          :options="chartOptions"
          :plugins="
            getPreferences('activate_zoom_on_graphs') ? [zoomPlugin] : ''
          "
          :pt="{
            root: { style: 'height: 100%; width: auto' },
            canvas: {
              style: 'height: 100%; width: auto',
            },
          }"
        />
      </div>
    </Dialog>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { getIdsOfTeam } from "../database/database.js";
import { convertMinuteToHoursMinute } from "../common/main";
import zoomPlugin from "chartjs-plugin-zoom";
import { getPreferences } from "../preferences/preferences";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const props = defineProps(["teamName", "backgroundColor", "titleColor"]);

const fullscreen = ref(false);

onMounted(() => {
  init();
});

const store = useStore();
const { sessions, teams } = storeToRefs(store);

const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const sessions_of_the_team = ref([]);
function setSessionsOfTheTeam() {
  for (let s of sessions.value) {
    if (id_of_team.value.includes(s.team.id)) {
      sessions_of_the_team.value.push(s);
    }
  }
}

const id_of_team = ref([]);

const labels_year_month = ref([]);
const game_duration_by_year_month = ref([]);
const joyrate_by_year_month = ref([]);

let map_game_duration = new Map();
let joyrate_map = new Map();
let sessions_map = new Map();
function calculateDurations() {
  let tmp_games = sessions_of_the_team.value.sort((a, b) => {
    return a.date.seconds - b.date.seconds;
  });

  let cpt = 0;
  let date = new Date(tmp_games[0].date.seconds * 1000);
  let year = date.getFullYear();
  let month = date.getMonth();
  let last_year = year;
  let last_month = month;
  for (const s of tmp_games) {
    date = new Date(s.date.seconds * 1000);
    year = date.getFullYear();
    month = date.getMonth();
    if (year === last_year && month === last_month) {
      cpt++;
    } else {
      cpt = 1;
      last_year = year;
      last_month = month;
    }
    //add duration and joyrate to the month
    if (map_game_duration.has(year)) {
      if (map_game_duration.get(year).has(month)) {
        map_game_duration
          .get(year)
          .set(month, map_game_duration.get(year).get(month) + s.duration);
        let joyrate = joyrate_map.get(year).get(month) + (s.was_cool ? 1 : 0);
        joyrate_map.get(year).set(month, joyrate);
        sessions_map.get(year).set(month, cpt);
      } else {
        //create month
        map_game_duration.get(year).set(month, s.duration);
        joyrate_map.get(year).set(month, s.was_cool ? 1 : 0);
        sessions_map.get(year).set(month, cpt);
      }
    } else {
      //create year
      map_game_duration.set(year, new Map().set(month, s.duration));
      joyrate_map.set(year, new Map().set(month, s.was_cool ? 1 : 0));
      sessions_map.set(year, new Map().set(month, cpt));
    }
  }
}

function setArraysForGraph() {
  for (let [year, monthMap] of map_game_duration) {
    for (let [month, duration] of monthMap) {
      labels_year_month.value.push(
        `${i18n.t("Common.months_names." + month)} ${year}`
      );
      game_duration_by_year_month.value.push(duration);
      joyrate_by_year_month.value.push(
        (joyrate_map.get(year).get(month) / sessions_map.get(year).get(month)) *
          100
      );
    }
  }
}

const chartData = ref({});
const chartOptions = ref();

function init() {
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);
  setSessionsOfTheTeam();
  calculateDurations();
  setArraysForGraph();
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
    labels: labels_year_month.value,
    datasets: [
      {
        label: i18n.t("LineChartGameByMonth.total_game_time"),
        data: game_duration_by_year_month.value,
        fill: false,
        borderColor: documentStyle.getPropertyValue("--cyan-500"),
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: i18n.t("LineChartGameByMonth.fun_to_play"),
        data: joyrate_by_year_month.value,
        fill: false,
        borderColor: documentStyle.getPropertyValue("--gray-500"),
        tension: 0.4,
        yAxisID: "y1",
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
    stacked: false,
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return (
              "" +
              convertMinuteToHoursMinute(
                game_duration_by_year_month.value[context.dataIndex]
              ) +
              " - " +
              joyrate_by_year_month.value[context.dataIndex].toFixed(2) +
              "%"
            );
          },
        },
      },
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
        position: "left",
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y1: {
        display: true,
        position: "right",
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          drawOnChartArea: false,
          color: surfaceBorder,
        },
      },
    },
  };
};
</script>
<style scoped>
.card {
  background-color: v-bind("backgroundColor");
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

@font-face {
  font-family: sephir;
  src: url("../assets/fonts/sephir/sephir.otf");
}

.lcgm-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: v-bind("props.titleColor");
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
