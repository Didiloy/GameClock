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
        content: { style: 'height:100%; ' },
      }"
    >
      <template #title>
        <span class="pth-font">
          {{ $t("PlayTimeHome.title") }}
          <i
            class="pi pi-window-maximize"
            @click="fullscreen = !fullscreen"
          ></i> </span
      ></template>
      <template #subtitle>
        <Chip
          :label="i18n.t('PlayTimeHome.click_to_see_details')"
          icon="pi pi-info-circle"
          style="background-color: var(--primary-100)"
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
              style: 'height: 100%; max-height:300px;  width: auto;',
            },
          }"
        />
      </template>
    </Card>
    <Dialog
      v-model:visible="fullscreen"
      modal
      dismissableMask
      :header="i18n.t('PlayTimeHome.title')"
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
<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import zoomPlugin from "chartjs-plugin-zoom";
import { useRouter } from "vue-router";
const router = useRouter();
import { getPreferences } from "../preferences/preferences";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const fullscreen = ref(false);

const loaded = ref(false);

const props = defineProps(["backgroundColor", "titleColor"]);
const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const store = useStore();
const { teams, sessions } = storeToRefs(store);
const teams_name = ref([]);

function getTeamsName(teams) {
  let arr = [];
  teams.map((team) => arr.push(team.name));
  return arr;
}

const teams_playtime = ref([]);
const getTeamsPlaytime = (teams) => {
  let arr = [];
  teams.map((team) => arr.push(team.playtime));
  return arr;
};

const teams_name_spliced = ref([]);
const getTeamNamesSpliced = () => {
  let res = [];
  teams_name.value.map((g) =>
    res.push(g.length > 10 ? g.slice(0, 6) + "..." : g),
  );
  return res;
};

const chartData = ref({});
const chartOptions = ref();

onMounted(() => {
  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    date: item.date.seconds,
    id: item.id,
    team: { id: item.team.id },
  }));

  const _teams = teams.value.map((item) => ({
    name: item.name,
    id: item.id,
  }));

  window.electron.ipcRenderer.send("playtimehome", {
    sessions: _sessions,
    teams: _teams,
  });
});

window.electron.ipcRenderer.on("result_playtimehome", (event, data) => {
  teams_name.value = getTeamsName(data);
  teams_name_spliced.value = getTeamNamesSpliced();
  teams_playtime.value = getTeamsPlaytime(data);
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
  loaded.value = true;
});

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);
  return {
    labels: teams_name_spliced.value,
    datasets: [
      {
        label: i18n.t("PlayTimeHome.playtime"),
        data: teams_playtime.value,
        backgroundColor: [
          documentStyle.getPropertyValue("--indigo-500"),
          documentStyle.getPropertyValue("--cyan-500"),
          documentStyle.getPropertyValue("--pink-500"),
          documentStyle.getPropertyValue("--teal-500"),
          documentStyle.getPropertyValue("--blue-500"),
          documentStyle.getPropertyValue("--bluegray-500"),
          documentStyle.getPropertyValue("--yellow-500"),
          documentStyle.getPropertyValue("--green-500"),
          documentStyle.getPropertyValue("--red-500"),
          documentStyle.getPropertyValue("--orange-500"),
          documentStyle.getPropertyValue("--purple-500"),
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
    "--text-color-secondary",
  );
  const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

  return {
    onClick: (e) => {
      const team_position = Math.abs(e.chart.scales.x.getValueForPixel(e.x));
      router.push("/team/" + teams_name.value[team_position]);
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
      tooltip: {
        callbacks: {
          beforeLabel: function (context) {
            return teams_name.value[context.dataIndex];
          },
          label: function (context) {
            return (
              i18n.t("PlayTimeHome.playtime") +
              convertMinuteToHoursMinute(
                teams_playtime.value[context.dataIndex],
              )
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
  background-color: v-bind("backgroundColor");
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

@font-face {
  font-family: sephir;
  src: url("../assets/fonts/sephir/sephir.otf");
}

.pth-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: v-bind("titleColor");
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
