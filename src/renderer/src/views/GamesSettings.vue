<template>
  <div class="gs-container">
      <h2 class="gs-title">Modifiez vos jeux</h2>
    <div class="gs-games">
      <SingleGameSetting
        class="gs-m"
        v-for="g in games.sort((a, b) => a.name.localeCompare(b.name))"
        :name="g.name"
        :heroe="g.heroe"
        :logo="g.logo"
      />
    </div>
  </div>
</template>
<script setup>
import SingleGameSetting from "../components/SingleGameSetting.vue";
import { ref } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";

const store = useStore();
const { games } = storeToRefs(store);
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

.gs-title{
  color: #5a5d9d;
  font-family: dishcek,serif;
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
  height: 70%;
  margin-bottom: 50px;
}

.gs-m {
  margin-top: 10px;
}
</style>
