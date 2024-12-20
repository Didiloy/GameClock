<script setup>
import { onMounted, ref, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { getIdsOfTeam } from "../database/database";
import zoomPlugin from "chartjs-plugin-zoom";
import { getPreferences } from "../preferences/preferences";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const props = defineProps([
  "teamName",
  "backgroundColor",
  "titleColor",
  "sessions",
]);
const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);

const fullscreen = ref(false);

const loaded = ref(false);
onMounted(() => {
  init();
});

const games_names = ref([]);

const fun_percentage = ref([]);
const neutral_percentage = ref([]);
const bad_percentage = ref([]);

function init() {
  fun_percentage.value = [];
  neutral_percentage.value = [];
  bad_percentage.value = [];

  const _games = games.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    date: item.date.seconds,
    id: item.id,
    was_cool: item.was_cool,
    teams: item.teams.map((team) => team),
    game: { id: item.game.id },
  }));

  const id_of_team = getIdsOfTeam(props.teamName, teams.value);

  window.electron.ipcRenderer.send("gamesfunpercentage", {
    ids_of_team: id_of_team,
    games: _games,
    sessions: _sessions,
  });
}

window.electron.ipcRenderer.on("result_gamesfunpercentage", (event, data) => {
  games_names.value = data.games_names;
  fun_percentage.value = data.fun_percentage;
  neutral_percentage.value = data.neutral_percentage;
  bad_percentage.value = data.bad_percentage;
  games_copy.value = games.value.slice();
  for (let i = games_names.value.length; i >= 0; i--) {
    if (
      isNaN(fun_percentage.value[i]) &&
      isNaN(neutral_percentage.value[i]) &&
      isNaN(bad_percentage.value[i])
    ) {
      fun_percentage.value.splice(i, 1);
      neutral_percentage.value.splice(i, 1);
      bad_percentage.value.splice(i, 1);
      games_names.value.splice(i, 1);
      games_copy.value.splice(i, 1);
    }
  }
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
  loaded.value = true;
});

const games_copy = ref([]);

const chartData = ref({});
const chartOptions = ref();
const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--text-color");

  return {
    labels: games_names.value,
    datasets: [
      {
        label: i18n.t("GamesFunPercentage.fun"),
        borderColor: documentStyle.getPropertyValue("--teal-500"),
        pointBackgroundColor: documentStyle.getPropertyValue("--teal-500"),
        pointBorderColor: documentStyle.getPropertyValue("--teal-500"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--teal-500"),
        data: fun_percentage.value,
        backgroundColor: documentStyle.getPropertyValue("--teal-500"),
      },
      {
        label: i18n.t("GamesFunPercentage.neutral"),
        borderColor: documentStyle.getPropertyValue("--yellow-400"),
        pointBackgroundColor: documentStyle.getPropertyValue("--yellow-400"),
        pointBorderColor: documentStyle.getPropertyValue("--yellow-400"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--yellow-400"),
        data: neutral_percentage.value,
        backgroundColor: documentStyle.getPropertyValue("--yellow-500"),
      },
      {
        label: i18n.t("GamesFunPercentage.bad"),
        borderColor: documentStyle.getPropertyValue("--red-400"),
        pointBackgroundColor: documentStyle.getPropertyValue("--red-400"),
        pointBorderColor: documentStyle.getPropertyValue("--red-400"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--red-400"),
        data: bad_percentage.value,
        backgroundColor: documentStyle.getPropertyValue("--red-500"),
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
    aspectRatio: 0.8,
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
          beforeLabel: function (context) {
            return games_copy.value[context.dataIndex].name;
          },
          label: function (context) {
            return context.dataset.data[context.dataIndex] + "%";
          },
        },
      },
      tooltips: {
        mode: "index",
        intersect: false,
      },
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          color: surfaceBorder,
        },
      },
      y: {
        stacked: true,
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
  <div v-else class="container">
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        body: { style: 'height:100%; ' },
        content: { style: 'height:100%; ' },
      }"
    >
      <template #subtitle>
        <span class="gfp-font">
          {{ $t("GamesFunPercentage.title") }}
          <i
            class="pi pi-window-maximize"
            @click="fullscreen = !fullscreen"
          ></i> </span
      ></template>
      <template #content>
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :plugins="
            getPreferences('activate_zoom_on_graphs') ? [zoomPlugin] : ''
          "
          :pt="{
            root: {
              style: 'height: 100%; max-height:300px; width: auto;',
            },
            canvas: {
              style: 'height: 100%; max-height:300px; width: auto;',
            },
          }"
        />
      </template>
    </Card>
    <Dialog
      v-model:visible="fullscreen"
      modal
      dismissableMask
      :header="i18n.t('GamesFunPercentage.title')"
      :style="{ width: '90%', height: '90%' }"
    >
      <div style="height: 80vh; width: 100%">
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :plugins="
            getPreferences('activate_zoom_on_graphs') ? [zoomPlugin] : ''
          "
          :pt="{
            root: {
              style: 'height: 100%; width: auto;',
            },
            canvas: {
              style: 'height: 100%; width: auto;',
            },
          }"
        />
      </div>
    </Dialog>
  </div>
</template>

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

.gfp-font {
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
