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
  <Card
    v-else
    class="card"
    :pt="{
      root: { style: 'box-shadow: 0px 0px 0px 0px;' },
      content: { style: 'height:100%; ' },
    }"
  >
    <template #title>
      <span class="gth-font">
        <span class="gth-subtitle">
          {{ $t("PieChartGamePercentage.title") }}
        </span>
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
      <Checkbox
        v-model="showLabel"
        inputId="show_label"
        :binary="true"
        @click="onShowLabelClick"
        style="height: 20px"
      />
      <label for="show_label" class="ml-2" style="font-size: 10pt">
        {{ $t("PieChartGamePercentage.show_names") }}
      </label>
      <div class="chart-wrapper">
        <div class="center-pie">
          <Chart
            type="pie"
            ref="chart"
            :data="chartData"
            :options="chartOptions"
            :plugins="[htmlLegendPlugin]"
            class="pie"
            :pt="{
              canvas: {
                class: 'p-chart',
                style: 'height: auto; max-height: 290px; width: 100%',
              },
            }"
          />
        </div>
        <div class="legend-container" id="legend-container"></div>
      </div>
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
    </template>
  </Card>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import SessionsHistory from "./SessionsHistory.vue";
import {
  convertMinuteToHoursMinute,
  generateRandomColor,
} from "../common/main";
import { getPreferences } from "../preferences/preferences";
import { getIdsOfTeam } from "../database/database";
import { useI18n } from "vue-i18n";
const i18n = useI18n();

const props = defineProps([
  "teamName",
  "backgroundColor",
  "titleColor",
  "sessions",
]);
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);

const loaded = ref(false);
onMounted(() => {
  init();
});

const chart = ref({});

const showLabel = ref(true);

function onShowLabelClick() {
  setLabels();
}

function setLabels() {
  if (!showLabel.value) {
    chart.value.data.labels = games_name.value;
  } else {
    chart.value.data.labels = games_name.value.map((g) => "");
  }
}

const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const games_name = ref([]);
const games_playtime = ref([]);
const games_percentage = ref([]);

const colors_of_pie_parts = ref([]);

function setColorsOfPieParts() {
  colors_of_pie_parts.value = [];
  if (!getPreferences("pie_chart_use_custom_colors")) {
    const documentStyle = getComputedStyle(document.body);
    const colors = [
      documentStyle.getPropertyValue("--blue-500"),
      documentStyle.getPropertyValue("--yellow-500"),
      documentStyle.getPropertyValue("--green-500"),
      documentStyle.getPropertyValue("--red-500"),
      documentStyle.getPropertyValue("--orange-500"),
      documentStyle.getPropertyValue("--purple-500"),
      documentStyle.getPropertyValue("--pink-500"),
      documentStyle.getPropertyValue("--teal-500"),
      documentStyle.getPropertyValue("--cyan-500"),
      documentStyle.getPropertyValue("--indigo-500"),
      documentStyle.getPropertyValue("--bluegray-500"),
    ];
    for (let i = 0; i < colors.length; i++) {
      colors_of_pie_parts.value.push(colors[i]);
    }
  } else {
    for (let i = 0; i < games_name.value.length; i++) {
      colors_of_pie_parts.value.push(generateRandomColor());
    }
  }
}

const chartData = ref({});
const chartOptions = ref();

function init() {
  const _games = games.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const _sessions = props.sessions
    ? props.sessions.map((item) => ({
        duration: item.duration,
        date: item.date.seconds,
        id: item.id,
        was_cool: item.was_cool,
        teams: item.teams.map((team) => team),
        game: { id: item.game.id },
      }))
    : sessions.value.map((item) => ({
        duration: item.duration,
        date: item.date.seconds,
        id: item.id,
        was_cool: item.was_cool,
        teams: item.teams.map((team) => team),
        game: { id: item.game.id },
      }));

  const id_of_team = getIdsOfTeam(props.teamName, teams.value);

  window.electron.ipcRenderer.send("piechartgamepercentage", {
    ids_of_team: id_of_team,
    games: _games,
    sessions: _sessions,
  });
}

window.electron.ipcRenderer.on(
  "result_piechartgamepercentage",
  (event, data) => {
    games_name.value = data.games_name;
    games_playtime.value = data.games_playtime;
    games_percentage.value = data.games_percentage;
    showLabel.value = getPreferences("pie_chart_labels_shown");
    setColorsOfPieParts();
    chartOptions.value = setChartOptions();
    chartData.value = setChartData();
    loaded.value = true;
  },
);

const selected_game_name = ref("");
const sessions_of_game = ref([]);
const show_sessions_of_game = ref(false);
function getSessionsOfGame(game_id) {
  const _sessions = [];
  for (const session of props.sessions ?? sessions.value)
    if (session.game.id === game_id) _sessions.push(session);
  return _sessions;
}

function getIdOfGame(game_name) {
  return games.value.find((game) => game.name === game_name).id;
}

const setChartData = () => {
  return {
    labels: showLabel.value
      ? games_name.value
      : games_name.value.map((g) => ""),
    datasets: [
      {
        data: games_playtime.value,
        backgroundColor: colors_of_pie_parts.value,
        hoverBackgroundColor: colors_of_pie_parts.value,
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--text-color");

  return {
    onClick: (event, elements) => {
      try {
        const selected_game = games_name.value[elements[0].index];
        selected_game_name.value = selected_game;
        sessions_of_game.value = getSessionsOfGame(getIdOfGame(selected_game));
        show_sessions_of_game.value = true;
      } catch (error) {
        console.log("Probably clicked outside.\nerror: ", error);
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          beforeLabel: function (context) {
            return games_name.value[context.dataIndex];
          },
          label: function (context) {
            return (
              convertMinuteToHoursMinute(
                games_playtime.value[context.dataIndex],
              ) +
              " -> " +
              games_percentage.value[context.dataIndex] +
              "%"
            );
          },
        },
      },
      htmlLegend: {
        containerID: "legend-container",
      },
      legend: {
        display: false,
        labels: {
          usePointStyle: true,
          color: textColor,
        },
      },
    },
  };
};

const getOrCreateLegendList = (chart, id) => {
  const legendContainer = document.getElementById(id);
  let listContainer = legendContainer.querySelector("ul");

  if (!listContainer) {
    listContainer = document.createElement("ul");
    listContainer.style.display = "flex";
    listContainer.style.flexDirection = "column";
    listContainer.style.overflowY = "scroll";
    listContainer.style.maxHeight = "300px";
    listContainer.style.margin = "0";
    listContainer.style.padding = "0";

    legendContainer.appendChild(listContainer);
  }

  return listContainer;
};

const htmlLegendPlugin = {
  id: "htmlLegend",
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, options.containerID);
    ul.style.maxWidth = "200px";

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins.legend.labels.generateLabels(chart);

    items.forEach((item) => {
      const li = document.createElement("li");
      li.style.alignItems = "center";
      li.style.cursor = "pointer";
      li.style.display = "flex";
      li.style.flexDirection = "row";
      li.style.marginLeft = "0px";
      li.style.marginTop = "5px";

      li.onclick = () => {
        const { type } = chart.config;
        if (type === "pie" || type === "doughnut") {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index);
        } else {
          chart.setDatasetVisibility(
            item.datasetIndex,
            !chart.isDatasetVisible(item.datasetIndex),
          );
        }
        chart.update();
      };

      // Color box
      const boxSpan = document.createElement("span");
      boxSpan.style.background = item.fillStyle;
      boxSpan.style.borderColor = item.strokeStyle;
      boxSpan.style.borderWidth = item.lineWidth + "px";
      boxSpan.style.borderRadius = "10px";
      boxSpan.style.display = "inline-block";
      boxSpan.style.flexShrink = 0;
      boxSpan.style.height = "20px";
      boxSpan.style.marginRight = "10px";
      boxSpan.style.width = "20px";
      boxSpan.style.border = item.hidden ? "1px dashed black" : "";

      // Text
      const textContainer = document.createElement("p");
      textContainer.style.color = item.fontColor;
      textContainer.style.margin = 0;
      textContainer.style.padding = 0;
      textContainer.style.textDecoration = item.hidden ? "line-through" : "";

      const text = document.createTextNode(item.text);
      textContainer.appendChild(text);

      li.appendChild(boxSpan);
      li.appendChild(textContainer);
      ul.appendChild(li);
    });
  },
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

.gth-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
}

.gth-subtitle {
  color: v-bind("props.titleColor");
}

.p-chart {
  height: 100%;
}

.chart-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.center-pie {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
