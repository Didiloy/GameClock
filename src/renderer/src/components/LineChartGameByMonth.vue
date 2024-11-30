<template>
  <div v-if="!loaded">
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        content: {
          style:
            'height:100%; display: flex; flex-direction: column; justify-content: center; align-items: center',
        },
      }"
    >
      <template #content>
        <p>{{ $t("Common.loading") }}</p>
      </template>
    </Card>
  </div>
  <div class="container" v-else>
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

const loaded = ref(false);
onMounted(() => {
  init();
});

const store = useStore();
const { sessions, teams } = storeToRefs(store);

const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const labels_year_month = ref([]);
const game_duration_by_year_month = ref([]);
const joyrate_by_year_month = ref([]);

const chartData = ref({});
const chartOptions = ref();

function init() {
  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    date: item.date.seconds,
    id: item.id,
    was_cool: item.was_cool,
    team: { id: item.team.id },
    game: { id: item.game.id },
  }));

  const id_of_team = getIdsOfTeam(props.teamName, teams.value);

  window.electron.ipcRenderer.send("linechartgamebymonth", {
    ids_of_team: id_of_team,
    sessions: _sessions,
  });
}

window.electron.ipcRenderer.on("result_linechartgamebymonth", (event, data) => {
  labels_year_month.value = data.labels_year_month;
  game_duration_by_year_month.value = data.game_duration_by_year_month;
  joyrate_by_year_month.value = data.joyrate_by_year_month;
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
  loaded.value = true;
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
    "--text-color-secondary",
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
                game_duration_by_year_month.value[context.dataIndex],
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
