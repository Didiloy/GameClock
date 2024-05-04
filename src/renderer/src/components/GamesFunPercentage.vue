<script setup>
import {onMounted, ref, watch} from "vue";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {getIdOfTeam} from "../database/database";

const props = defineProps(["teamName", "backgroundColor", "titleColor", "sessions"]);
const backgroundColor = props.backgroundColor ? props.backgroundColor : "var(--primary-100)";
const store = useStore();
const {games, sessions, teams} = storeToRefs(store);

const fullscreen = ref(false);


onMounted(() => {
  init();
});

watch(sessions, () => {
  init();
});

watch(() => props.sessions, () => {
  init();
});

const id_of_team = ref("");


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
    for (let s of props.sessions === undefined ? sessions.value : props.sessions) {
      if (id_of_team.value === "") {
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
        if (s.game.id === g.id && s.team.id === id_of_team.value) {
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
  id_of_team.value = getIdOfTeam(props.teamName, teams.value);
  games_copy.value = games.value.slice();
  games_names.value = getGamesNames();
  setPercentages();
  for (let i = games_names.value.length; i >= 0; i--) {
    if (isNaN(fun_percentage.value[i]) && isNaN(neutral_percentage.value[i]) && isNaN(bad_percentage.value[i])) {
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
        label: "Fun",
        borderColor: documentStyle.getPropertyValue("--teal-500"),
        pointBackgroundColor: documentStyle.getPropertyValue("--teal-500"),
        pointBorderColor: documentStyle.getPropertyValue("--teal-500"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--teal-500"),
        data: fun_percentage.value,
        backgroundColor: documentStyle.getPropertyValue("--teal-500"),
      },
      {
        label: "Neutre",
        borderColor: documentStyle.getPropertyValue("--orange-400"),
        pointBackgroundColor: documentStyle.getPropertyValue("--orange-400"),
        pointBorderColor: documentStyle.getPropertyValue("--orange-400"),
        pointHoverBackgroundColor: textColor,
        pointHoverBorderColor: documentStyle.getPropertyValue("--orange-400"),
        data: neutral_percentage.value,
        backgroundColor: documentStyle.getPropertyValue("--orange-500"),
      },
      {
        label: "Nul",
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
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      tooltip: {
        callbacks: {
          beforeLabel: function (context) {
            return (games_copy.value[context.dataIndex].name);
          },
          label: function (context) {
            return (
                context.dataset.data[context.dataIndex] +
                "%"
            );
          },
        },
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      legend: {
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      }
    }
  };
};
</script>

<template>
  <div class="container">
    <Card class="card"
          :pt="{
            root: { style: 'box-shadow: 0px 0px 0px 0px;' },
            body: { style: 'height:100%; ' },
            content: { style: 'height:100%; ' }
        }"
    >
      <template #subtitle>
        <span class="gfp-font">
          Taux de fun par jeux
          <i class="pi pi-window-maximize" @click="fullscreen = !fullscreen"></i>
        </span></template>
      <template #content>
        <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
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
    <Dialog v-model:visible="fullscreen" modal dismissableMask header="Taux de fun par jeux"
            :style="{ width: '90%', height: '90%' }">
      <div style="height: 80vh; width: 100%;">
        <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
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
  background-color: v-bind('backgroundColor');
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

@font-face {
  font-family: sephir;
  src: url('../assets/fonts/sephir/sephir.otf');
}

.gfp-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: v-bind('props.titleColor');
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center
}
</style>