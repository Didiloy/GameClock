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
      <template #title>
        <span class="lcgm-font"
          >{{ $t("LineChartPlayerOfTheWeek.title") }}
          <i
            class="pi pi-window-maximize"
            @click="fullscreen = !fullscreen"
          ></i> </span
      ></template>
      <template #subtitle>
        <Chip
          :label="i18n.t('LineChartLastMonth.click_to_see_details')"
          icon="pi pi-info-circle"
          style="background-color: var(--primary-300)"
        />
      </template>
      <template #content>
        <Chart
          type="line"
          :data="chartData"
          :options="chartOptions"
          :plugins="
            getPreferences('activate_zoom_on_graphs') ? [zoomPlugin] : ''
          "
          :pt="{
            root: { style: 'height: 100%;  width: auto' },
            canvas: {
              style: 'height: 100%; max-height:300px; width: auto',
            },
          }"
        />
      </template>
    </Card>
    <Dialog
      v-model:visible="fullscreen"
      modal
      dismissableMask
      :header="i18n.t('LineChartPlayerOfTheWeek.title')"
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
    <Dialog
      v-model:visible="show_sessions_of_day"
      modal
      dismissableMask
      :style="{ width: '90%', height: 'fit-content' }"
    >
      <div style="height: 100%; width: 100%">
        <SessionsHistory
          :title="
            i18n.t('LineChartLastMonth.title_session_of_day', [selected_day])
          "
          :teamName="props.teamName"
          :sessions="sessions_of_day"
        />
      </div>
    </Dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import zoomPlugin from "chartjs-plugin-zoom";
import { getPreferences } from "../preferences/preferences";
import SessionsHistory from "./SessionsHistory.vue";

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

const chartData = ref({});
const chartOptions = ref();
const labels_date = ref([]);
const map_player_time_played = ref(null);
const datasets = ref([]);

function init() {
  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    date: item.date.seconds,
    id: item.id,
    teams: item.teams.map((team) => team),
  }));

  const _teams = teams.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  window.electron.ipcRenderer.send("linechartplayeroftheweek", {
    sessions: _sessions,
    teams: _teams,
  });
}

window.electron.ipcRenderer.on(
  "result_linechartplayeroftheweek",
  (event, data) => {
    labels_date.value = data.labels_dates;
    map_player_time_played.value = data.map_player_time_played;
    //remove key where it's only 0 in the value
    const isAllZeros = (arr) => arr.every((value) => value === 0);

    for (const [key, value] of map_player_time_played.value) {
      if (isAllZeros(value)) {
        map_player_time_played.value.delete(key);
      }
    }
    const colors = [
      "--cyan-500",
      "--orange-500",
      "--blue-500",
      "--green-500",
      "--purple-500",
      "--yellow-500",
      "--red-500",
      "--pink-500",
      "--indigo-500",
      "--bluegray-500",
      "--red-800",
      "--blue-800",
      "--purple-700",
    ];
    const documentStyle = getComputedStyle(document.documentElement);
    datasets.value = Array.from(map_player_time_played.value.entries()).map(
      ([player, data], index) => ({
        label: player,
        data: data,
        fill: false,
        borderColor: documentStyle.getPropertyValue(
          colors[index % colors.length],
        ),
        tension: 0.4,
        yAxisID: "y",
      }),
    );
    chartOptions.value = setChartOptions();
    chartData.value = setChartData();
    loaded.value = true;
  },
);

const show_sessions_of_day = ref(false);
const selected_day = ref("");
const sessions_of_day = ref([]);
const selected_team = ref("");
function getSessionOfDay(day) {
  const sess = [];
  for (const session of sessions.value) {
    let date = new Date(session.date.seconds * 1000);
    let year = date.getFullYear();
    let month = date.getMonth();
    let d = date.getDate();
    let day_string = `${d < 9 ? "0" + d : d}/${month < 9 ? "0" + (month + 1) : month + 1}/${year}`;
    if (day_string === day && isTeamInSession(session, selected_team.value)) {
      sess.push(session);
    }
  }
  return sess;
}

function isTeamInSession(session, team) {
  //we have a team name and want a team id
  let team_id = teams.value.filter((t) => t.name === team)[0].id;
  return session.teams.includes(team_id);
}

const setChartData = () => {
  return {
    labels: labels_date.value,
    datasets: datasets.value,
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
    onClick: (event, elements) => {
      try {
        selected_day.value = labels_date.value[elements[0].index];
        selected_team.value = datasets.value[elements[0].datasetIndex].label;
        sessions_of_day.value = getSessionOfDay(selected_day.value);
        show_sessions_of_day.value = true;
      } catch (error) {
        //the user clicked outside the graph, don't do anything
        // console.log("Clicked outside the graph");
      }
    },
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
              context.dataset.label +
              " -> " +
              convertMinuteToHoursMinute(context.raw)
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
