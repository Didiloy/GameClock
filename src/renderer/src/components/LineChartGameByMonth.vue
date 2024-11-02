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
          :plugins="[zoomPlugin]"
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
          :plugins="[zoomPlugin]"
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

const game_duration_by_month = ref([]);
function setGameDuration() {
  game_duration_by_month.value = [];
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
  joyrate_by_month.value = [];
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

function init() {
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);
  setSessionsOfTheTeam();
  setGameDuration();
  setJoyrate();
  set_months_names();
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

const months_names = ref([]);
function set_months_names() {
  for (let i = 0; i < 12; i++) {
    months_names.value.push(i18n.t("Common.months_names." + i));
  }
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
    labels: months_names.value.slice(0, game_duration_by_month.value.length),
    datasets: [
      {
        label: i18n.t("LineChartGameByMonth.total_game_time"),
        data: game_duration_by_month.value,
        fill: false,
        borderColor: documentStyle.getPropertyValue("--cyan-500"),
        tension: 0.4,
      },
      {
        label: i18n.t("LineChartGameByMonth.fun_to_play"),
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
    "--text-color-secondary",
  );
  const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

  return {
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
                game_duration_by_month.value[context.dataIndex],
              ) +
              " - " +
              joyrate_by_month.value[context.dataIndex].toFixed(2) +
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
