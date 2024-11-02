<template>
  <div class="container">
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
          :plugins="[zoomPlugin]"
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
          :plugins="[zoomPlugin]"
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
import { computed, onMounted, ref } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import zoomPlugin from "chartjs-plugin-zoom";
import { useRouter } from "vue-router";
const router = useRouter();

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const fullscreen = ref(false);

onMounted(() => {
  init();
});

const props = defineProps(["backgroundColor", "titleColor"]);
const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const store = useStore();
const { teams, sessions } = storeToRefs(store);
const teams_from_db = ref([]);
const teams_name = ref([]);

function getTeamsName() {
  let arr = [];
  teams_from_db.value.map((team) => arr.push(team.name));
  return arr;
}

const teams_playtime = computed(() => {
  let arr = [];
  teams_from_db.value.map((team) => arr.push(team.playtime));
  return arr;
});

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

function getFirstTeamsByPlaytime(length) {
  let teams_to_return = [];
  for (const team of teams.value) {
    teams_to_return.push({
      name: team.name,
      playtime: sessions.value.reduce((acc, s) => {
        if (s.team.id === team.id) {
          return acc + s.duration;
        }
        return acc;
      }, 0),
    });
  }
  return teams_to_return
    .sort((a, b) => {
      return b.playtime - a.playtime;
    })
    .slice(0, length !== undefined ? length : -1);
}

function init() {
  teams_from_db.value = getFirstTeamsByPlaytime(teams.value.length);
  teams_name.value = getTeamsName();
  teams_name_spliced.value = getTeamNamesSpliced();
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

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
