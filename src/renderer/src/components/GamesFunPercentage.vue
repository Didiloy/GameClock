<script setup>
import { ref,  onMounted,  watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const props = defineProps(["teamName"]);
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);
onMounted(() => {
  init();
});

watch(sessions,() => {
  init();
});

const id_of_team = ref("");
function setIdOfTeam() {
  for (let t of teams.value) {
    if (t.name === props.teamName) {
      id_of_team.value = t.id;
    }
  }
}

const games_names = ref([]);
const getGamesNames = () => {
  let res = [];
  games.value.map((g) =>
      res.push(g.name.length > 10 ? g.name.slice(0, 10) + "..." : g.name)
  );
  return res;
};

const fun_percentage = ref([]);
const neutral_percentage = ref([]);
const bad_percentage = ref([]);
function setPercentages(){
  for(let g of games.value){
    let fun = 0;
    let neutral = 0;
    let bad = 0;
    let cpt = 0;
    for(let s of sessions.value){
      if(id_of_team.value === ""){
        if(s.game.id === g.id){
          cpt++;
          if(s.was_cool){
            fun++;
          }else if(s.was_cool === undefined){
            neutral++;
          }else{
            bad++;
          }
        }
      }else {
        if(s.game.id === g.id && s.team.id === id_of_team.value){
          cpt++;
          if(s.was_cool){
            fun++;
          }else if(s.was_cool === undefined){
            neutral++;
          }else{
            bad++;
          }
        }
      }
    }
    fun_percentage.value.push(((fun/cpt)*100).toFixed(2));
    neutral_percentage.value.push(((neutral/cpt)*100).toFixed(2));
    bad_percentage.value.push(((bad/cpt)*100).toFixed(2));
  }
}

function init(){
  fun_percentage.value = [];
  neutral_percentage.value = [];
  bad_percentage.value = [];
  setIdOfTeam();
  games_names.value = getGamesNames();
  setPercentages();
  for (let i = games_names.value.length; i >= 0; i--) {
    if (isNaN(fun_percentage.value[i]) && isNaN(neutral_percentage.value[i]) && isNaN(bad_percentage.value[i])) {
      fun_percentage.value.splice(i, 1);
      neutral_percentage.value.splice(i, 1);
      bad_percentage.value.splice(i, 1);
      games_names.value.splice(i, 1);
    }
  }
  chartOptions.value = setChartOptions();
  chartData.value = setChartData();
}


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
    <Card class="card">
      <template #subtitle> Taux de fun par jeux </template>
      <template #content>
        <Chart
            type="bar"
            :data="chartData"
            :options="chartOptions"
            :pt="{
            canvas: {
              class: 'p-chart',
              style: 'height: 100%; width: auto',
            },
          }"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--primary-100);
  width: 100%;
  height: 100%;
}

.p-chart {
  max-height: 100%;
}
</style>