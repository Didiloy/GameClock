<template>
  <div class="container">
    <Image :src="logo" width="250" class="header" />
    <PlayTimeHome class="play-time"></PlayTimeHome>
    <Card class="card">
      <template #title> Classement des équipes par temps de jeu </template>
      <template #content>
        <div class="game_cards">
          <LittleGameCard
            v-for="i in number_of_little_card"
            :key="i"
            :gameName="
              games_for_little_card[i - 1]
                ? games_for_little_card[i - 1].name
                : 'loading...'
            "
            :playtime="
              games_for_little_card[i - 1]
                ? games_for_little_card[i - 1].playtime
                : ''
            "
            :joyRate="
              games_for_little_card[i - 1]
                ? games_for_little_card[i - 1].joyRate
                : ''
            "
            :heroe="
              games_for_little_card[i - 1]
                ? games_for_little_card[i - 1].heroe
                : ''
            "
            :icon="
              games_for_little_card[i - 1]
                ? games_for_little_card[i - 1].icon
                : ''
            "
          ></LittleGameCard>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
import PlayTimeHome from "../components/PlayTimeHome.vue";
import LittleGameCard from "../components/LittleGameCard.vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { getFirstGamesByPlaytime } from "../database/database.js";

onMounted(() => {
  init();
});

const store = useStore();
const { games } = storeToRefs(store);
const games_for_little_card = ref([]);
const number_of_little_card = ref(3);

async function init() {
  games_for_little_card.value = await getFirstGamesByPlaytime(
    number_of_little_card.value
  );
}
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.card {
  background-color: var(--primary-100);
  width: 70vw;
}
.game_cards {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
}

.play-time {
  margin-top: 50px;
}
</style>
