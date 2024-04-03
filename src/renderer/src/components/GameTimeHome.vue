<template>
  <Card
      class="card"
      :pt="{
    root: { style: 'box-shadow: 0px 0px 0px 0px;' },
      content: { style: 'height:100%; ' }
    }"
  >
    <template #subtitle> <span class="gth-font">
      <span class="gth-subtitle">
        Classement des jeux en pourcentage
      </span>
    </span>
    </template>
    <template #content>
      <Checkbox v-model="showLabel" inputId="show_label" :binary="true" @click="onShowLabelClick"
                style="height: 20px;"/>
      <label for="show_label" class="ml-2" style="font-size: 10pt;"> Montrer les noms </label>
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
              style: 'height: auto; width: 100%',
            },
          }"
          />
        </div>
        <div class="legend-container" id="legend-container"></div>
      </div>
    </template>
  </Card>
</template>
<script setup>
import {onMounted, ref, watch} from "vue";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {convertMinuteToHoursMinute, generateRandomColor} from "../common/main";
import {getPreferences} from "../preferences/preferences";

const props = defineProps(["teamName", "backgroundColor", "titleColor"]);
const store = useStore();
const {games, sessions, teams} = storeToRefs(store);

onMounted(() => {
  init();
});

watch([games, sessions, teams], () => {
  init();
});

const chart = ref({});

const showLabel = ref(getPreferences("pie_chart_labels_shown"));

function onShowLabelClick() {
  showLabel.value = !showLabel.value;
  setLabels();
}

function setLabels() {
  if (showLabel.value) {
    chart.value.data.labels = games_name.value;
  } else {
    chart.value.data.labels = games_name.value.map((g) => "");
  }
}

const backgroundColor = props.backgroundColor ? props.backgroundColor : "var(--primary-100)";

const id_of_team = ref("");

function setIdOfTeam() {
  for (let t of teams.value) {
    if (t.name === props.teamName) {
      id_of_team.value = t.id;
    }
  }
}

const games_name = ref([]);

const games_playtime = ref([]);

const games_percentage = ref([]);

function setGamesNameAndPlaytime() {
  let temp_games = [];
  let total_playtime = 0;
  if (id_of_team.value) {
    for (let g of games.value) {
      let acc = 0;
      for (let s of sessions.value) {
        if (s.team.id === id_of_team.value && s.game.id === g.id) {
          acc += s.duration;
          total_playtime += s.duration;
        }
      }
      temp_games.push({name: g.name, playtime: acc});
    }
  } else {
    for (let g of games.value) {
      let acc = 0;
      for (let s of sessions.value) {
        if (s.game.id === g.id) {
          acc += s.duration;
          total_playtime += s.duration;
        }
      }
      temp_games.push({name: g.name, playtime: acc});
    }
  }
  temp_games.sort((a, b) => b.playtime - a.playtime);
  temp_games = temp_games.filter((g) => g.playtime > 0);
  games_name.value = temp_games.map((g) => g.name);
  games_percentage.value = temp_games.map((g) =>
      ((g.playtime / total_playtime) * 100).toFixed(0)
  );
  games_playtime.value = temp_games.map((g) => g.playtime);
}

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
    for(let i = 0; i < colors.length; i++) {
      colors_of_pie_parts.value.push(colors[i]);
    }
  }else {
    for(let i = 0; i < games_name.value.length; i++) {
      colors_of_pie_parts.value.push(generateRandomColor());
    }
  }
}

const chartData = ref({});
const chartOptions = ref();

function init() {
  setIdOfTeam();
  setGamesNameAndPlaytime();
  setColorsOfPieParts();
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}

const setChartData = () => {
  const documentStyle = getComputedStyle(document.body);

  return {
    labels: showLabel.value ? games_name.value : games_name.value.map((g) => ""),
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
    plugins: {
      tooltip: {
        callbacks: {
          beforeLabel: function (context) {
            return games_name.value[context.dataIndex];
          },
          label: function (context) {
            return (
                convertMinuteToHoursMinute(
                    games_playtime.value[context.dataIndex]
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
  let listContainer = legendContainer.querySelector('ul');

  if (!listContainer) {
    listContainer = document.createElement('ul');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.overflowY = 'scroll';
    listContainer.style.maxHeight = '300px';
    listContainer.style.margin = "0";
    listContainer.style.padding = "0";

    legendContainer.appendChild(listContainer);
  }

  return listContainer;
};

const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterUpdate(chart, args, options) {
    const ul = getOrCreateLegendList(chart, options.containerID);
    ul.style.maxWidth = "200px";

    // Remove old legend items
    while (ul.firstChild) {
      ul.firstChild.remove();
    }

    // Reuse the built-in legendItems generator
    const items = chart.options.plugins.legend.labels.generateLabels(chart);

    items.forEach(item => {
      const li = document.createElement('li');
      li.style.alignItems = 'center';
      li.style.cursor = 'pointer';
      li.style.display = 'flex';
      li.style.flexDirection = 'row';
      li.style.marginLeft = '0px';
      li.style.marginTop = '5px';

      li.onclick = () => {
        const {type} = chart.config;
        if (type === 'pie' || type === 'doughnut') {
          // Pie and doughnut charts only have a single dataset and visibility is per item
          chart.toggleDataVisibility(item.index);
        } else {
          chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
        }
        chart.update();
      };

      // Color box
      const boxSpan = document.createElement('span');
      boxSpan.style.background = item.fillStyle;
      boxSpan.style.borderColor = item.strokeStyle;
      boxSpan.style.borderWidth = item.lineWidth + 'px';
      boxSpan.style.borderRadius = '10px';
      boxSpan.style.display = 'inline-block';
      boxSpan.style.flexShrink = 0;
      boxSpan.style.height = '20px';
      boxSpan.style.marginRight = '10px';
      boxSpan.style.width = '20px';

      // Text
      const textContainer = document.createElement('p');
      textContainer.style.color = item.fontColor;
      textContainer.style.margin = 0;
      textContainer.style.padding = 0;
      textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

      const text = document.createTextNode(item.text);
      textContainer.appendChild(text);

      li.appendChild(boxSpan);
      li.appendChild(textContainer);
      ul.appendChild(li);
    });
  }
};
</script>
<style scoped>
.card {
  background-color: v-bind('backgroundColor');
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

@font-face {
  font-family: sephir;
  src: url('../assets/fonts/sephir/sephir.otf');
}

.gth-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
}

.gth-subtitle {
  color: v-bind('props.titleColor');
}

.p-chart {
  height: 100%;
}

.legend-container {
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
