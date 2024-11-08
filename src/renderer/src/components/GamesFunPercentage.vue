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
  setTimeout(() => {
    init();
    loaded.value = true;
  }, 500);
  // init();
});

watch(sessions, () => {
  init();
});

watch(
  () => props.sessions,
  () => {
    init();
  }
);

const id_of_team = ref([]);

const games_names = ref([]);
const getGamesNames = () => {
  let res = [];
  games.value.map((g) =>
    res.push(g.name.length > 10 ? g.name.slice(0, 6) + "..." : g.name)
  );
  return res;
};

const fun_percentage = ref([]);
const neutral_percentage = ref([]);
const bad_percentage = ref([]);

function setPercentages() {
  for (let g of games.value) {
    let fun = 0;
    let neutral = 0;
    let bad = 0;
    let cpt = 0;
    for (let s of props.sessions === undefined
      ? sessions.value
      : props.sessions) {
      if (id_of_team.value.length === 0) {
        if (s.game.id === g.id) {
          cpt++;
          if (s.was_cool) {
            fun++;
          } else if (s.was_cool === undefined) {
            neutral++;
          } else {
            bad++;
          }
        }
      } else {
        if (s.game.id === g.id && id_of_team.value.includes(s.team.id)) {
          cpt++;
          if (s.was_cool) {
            fun++;
          } else if (s.was_cool === undefined) {
            neutral++;
          } else {
            bad++;
          }
        }
      }
    }
    fun_percentage.value.push(((fun / cpt) * 100).toFixed(2));
    neutral_percentage.value.push(((neutral / cpt) * 100).toFixed(2));
    bad_percentage.value.push(((bad / cpt) * 100).toFixed(2));
  }
}

function init() {
  fun_percentage.value = [];
  neutral_percentage.value = [];
  bad_percentage.value = [];
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);
  games_copy.value = games.value.slice();
  games_names.value = getGamesNames();
  setPercentages();
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
}

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
    "--text-color-secondary"
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
