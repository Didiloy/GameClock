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
    <template #subtitle>
      <span class="gth-font">
        <span class="gth-subtitle">
          {{ $t("PieChartGamePercentage.title_platform") }}
        </span>
      </span>
    </template>
    <template #content>
      <Checkbox
        v-model="showLabel"
        inputId="show_label_platforms"
        :binary="true"
        @click="onShowPlatformsLabelClick"
        style="height: 20px"
      />
      <label for="show_label_platforms" class="ml-2" style="font-size: 10pt">
        {{ $t("PieChartGamePercentage.show_names") }}
      </label>
      <div class="chart-wrapper">
        <div class="center-pie">
          <Chart
            type="doughnut"
            ref="chart"
            :data="chartData"
            :options="chartOptions"
            :plugins="[htmlLegendPlugin]"
            class="pie"
            :pt="{
              canvas: {
                class: 'p-chart',
                style: 'height: auto; width: 100%',
              },
            }"
          />
        </div>
        <div
          class="legend-container-platform"
          id="legend-container-platform"
        ></div>
      </div>
    </template>
  </Card>
</template>
<script setup>
//COPIED FROM PieChartGamePercentage.vue. NEED TO BE REFACTORED to not repeat code
import { onMounted, ref, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
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
const { sessions, teams, platforms } = storeToRefs(store);

const loaded = ref(false);
onMounted(() => {
  init();
});

const chart = ref({});

const showLabel = ref(true);

function onShowPlatformsLabelClick() {
  setPlatformsLabels();
}

function setPlatformsLabels() {
  if (!showLabel.value) {
    chart.value.data.labels = platforms_name.value;
  } else {
    chart.value.data.labels = platforms_name.value.map((g) => "");
  }
}

const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";

const id_of_team = ref([]);

const platforms_name = ref([]);

const platform_playtime = ref([]);
const platform_percentage = ref([]);
const platform_number_of_sessions = ref([]);

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
    for (let i = 0; i < platforms_name.value.length; i++) {
      colors_of_pie_parts.value.push(generateRandomColor());
    }
  }
}

const chartData = ref({});
const chartOptions = ref();

function init() {
  const _platforms = platforms.value.map((item) => ({
    id: item.id,
    name: item.name,
  }));

  const _sessions = sessions.value.map((item) => ({
    duration: item.duration,
    date: item.date.seconds,
    id: item.id,
    platform: item.platform ? { id: item.platform.id } : undefined,
    teams: item.teams.map((team) => team),
  }));

  const id_of_team = getIdsOfTeam(props.teamName, teams.value);

  window.electron.ipcRenderer.send("doughnutchartplatform", {
    ids_of_team: id_of_team,
    sessions: _sessions,
    platforms: _platforms,
  });
}

window.electron.ipcRenderer.on(
  "result_doughnutchartplatform",
  (event, data) => {
    platforms_name.value = data.platforms_name;
    platform_playtime.value = data.platform_playtime;
    platform_percentage.value = data.platform_percentage;
    platform_number_of_sessions.value = data.platform_number_of_sessions;
    showLabel.value = getPreferences("pie_chart_labels_shown");
    setColorsOfPieParts();
    chartOptions.value = setChartOptions();
    chartData.value = setChartData();
    loaded.value = true;
  },
);

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);

  return {
    labels: showLabel.value
      ? platforms_name.value
      : platforms_name.value.map((g) => ""),
    datasets: [
      {
        data: platform_playtime.value,
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
    plugins: {
      tooltip: {
        callbacks: {
          beforeLabel: function (context) {
            return platforms_name.value[context.dataIndex];
          },
          label: function (context) {
            return (
              convertMinuteToHoursMinute(
                platform_playtime.value[context.dataIndex],
              ) +
              " -> " +
              platform_percentage.value[context.dataIndex] +
              "%, " +
              i18n.t("GamesSettings.sessions_number") +
              " " +
              platform_number_of_sessions.value[context.dataIndex]
            );
          },
        },
      },
      htmlLegendPlatform: {
        containerID: "legend-container-platform",
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
  id: "htmlLegendPlatform",
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
