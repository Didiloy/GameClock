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
        content: { style: 'height:100%; width: auto;' },
      }"
    >
      <template #title>
        <span class="bcag-font">
          {{ $t("BarChartAllGames.title") }}
          <i
            class="pi pi-window-maximize"
            @click="fullscreen = !fullscreen"
          ></i>
        </span>
      </template>
      <template #subtitle>
        <Chip
          :label="i18n.t('BarChartAllGames.click_to_see_details')"
          icon="pi pi-info-circle"
          style="background-color: var(--primary-300)"
        />
      </template>
      <template #content>
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          :plugins="
            getPreferences('activate_zoom_on_graphs') ? [zoomPlugin] : ''
          "
          :pt="{
            canvas: {
              style: 'height: 100%; max-height: 300px; width: auto',
            },
          }"
        />
      </template>
    </Card>
    <Dialog
      v-model:visible="fullscreen"
      modal
      dismissableMask
      :header="i18n.t('BarChartAllGames.title')"
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
            root: { style: 'height: 100%; width: 100%' },
            canvas: {
              style: 'height: 100%; max-height: 100%',
            },
          }"
        />
      </div>
    </Dialog>
    <Dialog
      v-model:visible="show_sessions_of_game"
      modal
      dismissableMask
      :style="{ width: '90%', height: 'fit-content' }"
    >
      <div style="height: 100%; width: 100%">
        <SessionsHistory
          :title="
            i18n.t('BarChartAllGames.sessions_history', [selected_game_name])
          "
          :teamName="props.teamName"
          :sessions="sessions_of_game"
        />
      </div>
    </Dialog>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import { getIdsOfTeam } from "../database/database";
import zoomPlugin from "chartjs-plugin-zoom";
import { useI18n } from "vue-i18n";
import { getPreferences } from "../preferences/preferences";
import SessionsHistory from "./SessionsHistory.vue";
const i18n = useI18n();

const props = defineProps([
  "teamName",
  "backgroundColor",
  "titleColor",
  "sessions",
]);
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);

const fullscreen = ref(false);

const loaded = ref(false);
onMounted(() => {
  init();
});

const selected_game_name = ref("");
const sessions_of_game = ref([]);
const show_sessions_of_game = ref(false);
function getSessionsOfGame(game_id) {
  const _sessions = [];
  for (const session of props.sessions ?? sessions.value)
    if (session.game.id === game_id) _sessions.push(session);
  return _sessions;
}

const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const games_names = ref([]);
const sessions_number = ref([]);
const avg_duration = ref([]);

const chartData = ref({});
const chartOptions = ref();

const games_copy = ref([]);

function init() {
  const _games = games.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    date: item.date.seconds,
    id: item.id,
    teams: item.teams.map((team) => team),
    game: { id: item.game.id },
  }));

  const id_of_team = getIdsOfTeam(props.teamName, teams.value);

  window.electron.ipcRenderer.send("barchartallgames", {
    ids_of_team: id_of_team,
    team_name: props.teamName,
    games: _games,
    sessions: _sessions,
  });
}

window.electron.ipcRenderer.on("result_barchartallgames", (event, data) => {
  games_names.value = data.games_names;
  sessions_number.value = data.sessions_number;
  avg_duration.value = data.averages_duration;
  games_copy.value = games.value.slice();

  //remove games that have no sessions
  for (let i = games_names.value.length; i >= 0; i--) {
    if (sessions_number.value[i] === 0) {
      games_names.value.splice(i, 1);
      sessions_number.value.splice(i, 1);
      avg_duration.value.splice(i, 1);
      games_copy.value.splice(i, 1);
    }
  }
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
  loaded.value = true;
});

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--text-color");

  return {
    labels: games_names.value,
    datasets: [
      {
        label: i18n.t("BarChartAllGames.number_of_sessions"),
        borderColor: documentStyle.getPropertyValue("--blue-500"),
        pointBackgroundColor: documentStyle.getPropertyValue("--blue-500"),
        pointBorderColor: documentStyle.getPropertyValue("--blue-500"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--blue-500"),
        data: sessions_number.value,
        backgroundColor: documentStyle.getPropertyValue("--blue-500"),
      },
      {
        label: i18n.t("BarChartAllGames.medium_session_time"),
        borderColor: documentStyle.getPropertyValue("--pink-400"),
        pointBackgroundColor: documentStyle.getPropertyValue("--pink-400"),
        pointBorderColor: documentStyle.getPropertyValue("--pink-400"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--pink-400"),
        data: avg_duration.value,
        backgroundColor: documentStyle.getPropertyValue("--pink-500"),
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

  return {
    onClick: (event, elements) => {
      try {
        const selected_game = games_copy.value[elements[0].index];
        selected_game_name.value = selected_game.name;
        sessions_of_game.value = getSessionsOfGame(selected_game.id);
        show_sessions_of_game.value = true;
      } catch (error) {
        console.log("Probably clicked outside.\nerror: ", error);
      }
    },
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
      legend: {
        labels: {
          color: textColor,
        },
      },
      tooltip: {
        callbacks: {
          beforeLabel: function (context) {
            return games_copy.value[context.dataIndex].name;
          },
          label: function (tooltipItem) {
            if (tooltipItem.datasetIndex === 1) {
              return (
                i18n.t("BarChartAllGames.medium_session_time") +
                ": " +
                convertMinuteToHoursMinute(
                  avg_duration.value[tooltipItem.dataIndex],
                )
              );
            }
          },
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
  background-color: v-bind("backgroundColor");
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

@font-face {
  font-family: sephir;
  src: url("../assets/fonts/sephir/sephir.otf");
}

.bcag-font {
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
