<template>
  <div class="container">
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        content: { style: 'height:100%; width: auto;' },
      }"
    >
      <template #subtitle>
        <span class="bcag-font">
          {{ $t("BarChartAllGames.title") }}
          <i
            class="pi pi-window-maximize"
            @click="fullscreen = !fullscreen"
          ></i>
        </span>
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
              style: 'height: 100%; max-height: 350px; width: auto',
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
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import { getIdsOfTeam } from "../database/database";
import zoomPlugin from "chartjs-plugin-zoom";
import { useI18n } from "vue-i18n";
import { getPreferences } from "../preferences/preferences";
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

onMounted(() => {
  init();
});

watch([games, sessions, teams], () => {
  init();
});

watch(
  () => props.sessions,
  () => {
    init();
  },
);

const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const games_names = ref([]);
const getGamesNames = () => {
  let res = [];
  games.value.map((g) =>
    res.push(g.name.length > 10 ? g.name.slice(0, 6) + "..." : g.name),
  );
  return res;
};
const sessions_number = ref([]);
const getSessionNumber = () => {
  let res = [];
  for (let g of games.value) {
    let acc = 0;
    if (props.teamName) {
      for (let s of props.sessions === undefined
        ? sessions.value
        : props.sessions) {
        if (s.game.id === g.id && id_of_team.value.includes(s.team.id)) {
          acc += 1;
        }
      }
    } else {
      for (let s of props.sessions === undefined
        ? sessions.value
        : props.sessions) {
        if (s.game.id === g.id) {
          acc += 1;
        }
      }
    }
    res.push(acc);
  }
  return res;
};

const id_of_team = ref([]);

const avg_duration = ref([]);
const getAverageDuration = () => {
  let res = [];
  for (let g of games.value) {
    let acc = 0;
    let ss_num = 0;
    if (props.teamName) {
      for (let s of props.sessions === undefined
        ? sessions.value
        : props.sessions) {
        if (s.game.id === g.id && id_of_team.value.includes(s.team.id)) {
          acc += s.duration;
          ss_num++;
        }
      }
    } else {
      for (let s of props.sessions === undefined
        ? sessions.value
        : props.sessions) {
        if (s.game.id === g.id) {
          acc += s.duration;
          ss_num++;
        }
      }
    }
    res.push(acc / ss_num);
  }
  return res;
};

const chartData = ref({});
const chartOptions = ref();

const games_copy = ref([]);

function init() {
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);
  games_names.value = getGamesNames();
  sessions_number.value = getSessionNumber();
  avg_duration.value = getAverageDuration();
  games_copy.value = games.value.slice();
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
}

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
