<template>
  <div class="gs-container">
    <h2 class="gs-title">Modifiez vos jeux</h2>
    <div>
      <InputText type="text" v-model="value" placeholder="Chercher un jeu..." style="height: 30px;"/>
    </div>
    <i>{{games_values.length}} jeux</i>
    <div class="gs-games">
      <SingleGameSetting
          class="gs-m"
          v-for="g in games_values.sort((a, b) => a.name.localeCompare(b.name))"
          :name="g.name"
          :heroe="g.heroe"
          :logo="g.logo"
      />
    </div>
  </div>
</template>
<script setup>
import SingleGameSetting from "../components/SingleGameSetting.vue";
import {useStore} from "../store/store";
import {storeToRefs} from "pinia";
import {onMounted, ref, watch} from "vue";

const store = useStore();
const {games} = storeToRefs(store);
const games_values = ref([]);
const value = ref("");

onMounted(() => {
  games_values.value = games.value;
});

watch(value, () => {
  games_values.value = games.value.filter((g) => g.name.toLowerCase().includes(value.value.toLowerCase()));
});

</script>
<style scoped>
.gs-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
}

@font-face {
  font-family: dishcek;
  src: url('../assets/fonts/dishcek/Dishcek.otf');
}

.gs-title {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}


.gs-games {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 80%;
  margin-bottom: 50px;
}

.gs-m {
  margin-top: 10px;
}
</style>
