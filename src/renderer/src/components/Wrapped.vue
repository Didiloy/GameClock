<template>
  <div class="wrapped-container">
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>{{ $t("Common.loading") }}</p>
    </div>

    <div v-else-if="!stats" class="empty-state">
      <p>{{ $t("Wrapped.no_data_year") }}</p>
    </div>

    <div v-else class="content-wrapper">
      <div class="navigation-btn prev" @click="prevPage" v-if="currentPage > 0">
        <i class="pi pi-chevron-left"></i>
      </div>

      <div class="page-container">
        <Transition :name="transitionName" mode="out-in">
          <div :key="currentPage" class="page-content">
            <!-- Page 0: Intro -->
            <div v-if="currentPage === 0" class="page intro-page">
              <h1>{{ $t("Wrapped.title", { year: stats.year }) }}</h1>
              <p class="subtitle">{{ $t("Wrapped.subtitle") }}</p>
              <div class="intro-icon">
                <i class="pi pi-gift"></i>
              </div>
            </div>

            <!-- Page 1: Total Time & Games -->
            <div v-else-if="currentPage === 1" class="page summary-page">
              <h2>{{ $t("Wrapped.overview") }}</h2>
              <div class="stat-big">
                <span class="value">{{ convertMinuteToHoursMinute(stats.totalTime) }}</span>
                <span class="label">{{ $t("Wrapped.total_playtime") }}</span>
              </div>
              <div class="stat-medium">
                <span class="value">{{ stats.numberOfGames }}</span>
                <span class="label">{{ $t("Wrapped.games_played") }}</span>
              </div>
            </div>

            <!-- Page 2: Top Games (Time) -->
            <div v-else-if="currentPage === 2" class="page list-page">
              <h2>{{ $t("Wrapped.top_games_by_time") }}</h2>
              <div class="ranking-list">
                <div v-for="(game, index) in stats.topGamesByTime" :key="game.id" class="ranking-item">
                  <span class="rank">#{{ index + 1 }}</span>
                  <div class="game-info">
                    <img
                      class="game-logo"
                      :src="game.image || game.logo"
                      :alt="game.name"
                    />
                    <span class="game-name">{{ game.name }}</span>
                    <span class="game-stat">{{ convertMinuteToHoursMinute(game.duration) }}</span>
                  </div>
                </div>
              </div>
            </div>

             <!-- Page 3: Top Games (Sessions) -->
            <div v-else-if="currentPage === 3" class="page list-page">
              <h2>{{ $t("Wrapped.top_games_by_sessions") }}</h2>
              <div class="ranking-list">
                <div v-for="(game, index) in stats.topGamesBySessions" :key="game.id" class="ranking-item">
                  <span class="rank">#{{ index + 1 }}</span>
                  <div class="game-info">
                    <img
                      class="game-logo"
                      :src="game.image || game.logo"
                      :alt="game.name"
                    />
                    <span class="game-name">{{ game.name }}</span>
                    <span class="game-stat">{{ game.sessions }} {{ $t("Wrapped.sessions") }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 4: Time Patterns -->
            <div v-else-if="currentPage === 4" class="page patterns-page">
              <h2>{{ $t("Wrapped.when_you_played") }}</h2>
              <div class="grid-stats">
                <div class="grid-item">
                   <i class="pi pi-calendar"></i>
                   <span class="label">{{ $t("Wrapped.most_active_month") }}</span>
                   <span class="value">{{ getMonthName(stats.mostPlayedMonth.month) }}</span>
                   <span class="sub-value">{{ convertMinuteToHoursMinute(stats.mostPlayedMonth.duration) }}</span>
                </div>
                <div class="grid-item">
                   <i class="pi pi-calendar-plus"></i>
                   <span class="label">{{ $t("Wrapped.most_active_day") }}</span>
                   <span class="value">{{ new Date(stats.mostPlayedDay.date).toLocaleDateString() }}</span>
                   <span class="sub-value">{{ convertMinuteToHoursMinute(stats.mostPlayedDay.duration) }}</span>
                </div>
                 <div class="grid-item">
                   <i class="pi pi-clock"></i>
                   <span class="label">{{ $t("Wrapped.most_active_week") }}</span>
                   <span class="value">{{ $t("Wrapped.most_acive_week_subtitle") }} {{ stats.mostPlayedWeek.week }}</span>
                   <span class="sub-value">{{ convertMinuteToHoursMinute(stats.mostPlayedWeek.duration) }}</span>
                </div>
              </div>
            </div>

            <!-- Page 5: Fun Stats -->
            <div v-else-if="currentPage === 5" class="page fun-page">
              <h2>{{ $t("Wrapped.highs_lows") }}</h2>
              <div class="fun-stats">
                <div class="fun-item positive" v-if="stats.mostFunGame">
                  <i class="pi pi-thumbs-up-fill"></i>
                  <span class="label">{{ $t("Wrapped.most_fun") }}</span>
                  <span class="game-name">{{ stats.mostFunGame.name }}</span>
                  <span class="score">{{ (stats.mostFunGame.averageJoyrate * 100).toFixed(1) }}%</span>
                </div>
                 <div class="fun-item negative" v-if="stats.leastFunGame">
                  <i class="pi pi-thumbs-down-fill"></i>
                  <span class="label">{{ $t("Wrapped.least_fun") }}</span>
                  <span class="game-name">{{ stats.leastFunGame.name }}</span>
                  <span class="score">{{ (stats.leastFunGame.averageJoyrate * 100).toFixed(1) }}%</span>
                </div>
              </div>
              <div class="first-last" v-if="stats.firstGameOfYear || stats.lastGameOfYear">
                <div class="ranking-list">
                  <div v-if="stats.firstGameOfYear" class="ranking-item">
                    <span class="rank">1</span>
                    <div class="game-info">
                      <img
                        class="game-logo"
                        :src="stats.firstGameOfYear.image || stats.firstGameOfYear.logo"
                        :alt="stats.firstGameOfYear.name"
                      />
                      <div class="game-info-text">
                        <span class="game-stat">{{ $t("Wrapped.first_game_title") }}</span>
                        <span class="game-name">{{ stats.firstGameOfYear.name }}</span>
                        <span class="sub-value">{{ new Date(stats.firstGameOfYear.date * 1000).toLocaleDateString() }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="stats.lastGameOfYear" class="ranking-item">
                    <span class="rank">2</span>
                    <div class="game-info">
                      <img
                        class="game-logo"
                        :src="stats.lastGameOfYear.image || stats.lastGameOfYear.logo"
                        :alt="stats.lastGameOfYear.name"
                      />
                      <div class="game-info-text">
                        <span class="game-stat">{{ $t("Wrapped.last_game_title") }}</span>
                        <span class="game-name">{{ stats.lastGameOfYear.name }}</span>
                        <span class="sub-value">{{ new Date(stats.lastGameOfYear.date * 1000).toLocaleDateString() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 6: Longest Avg Sessions -->
            <div v-else-if="currentPage === 6" class="page list-page">
              <h2>{{ $t("Wrapped.longest_sessions") }}</h2>
              <div class="ranking-list" v-if="stats.topLongestAvgGames && stats.topLongestAvgGames.length">
                <div
                  v-for="(game, index) in stats.topLongestAvgGames"
                  :key="game.id"
                  class="ranking-item"
                >
                  <span class="rank">#{{ index + 1 }}</span>
                  <div class="game-info">
                    <img
                      class="game-logo"
                      :src="game.image || game.logo"
                      :alt="game.name"
                    />
                    <span class="game-name">{{ game.name }}</span>
                    <span class="game-stat">~{{ convertMinuteToHoursMinute(game.avgDuration) }} / {{ $t("Wrapped.session") }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Page 7: Social -->
            <div v-else-if="currentPage === 7" class="page social-page">
               <h2>{{ $t("Wrapped.best_friends") }}</h2>
               <div v-if="stats.bestFriends && stats.bestFriends.length > 0" class="friends-list">
                 <div v-for="(friend, index) in stats.bestFriends" :key="friend.id" class="friend-item">
                   <div class="avatar-placeholder-small">
                      <i class="pi pi-user"></i>
                   </div>
                   <div class="friend-info">
                       <span class="friend-name-small">{{ friend.name }}</span>
                       <span class="friend-stats">{{ $t("Wrapped.sessions_together", { count: friend.count }) }}</span>
                   </div>
                   <div class="rank-badge" v-if="index === 0">🏆</div>
                 </div>
               </div>
               <div v-else class="solo-player">
                 <i class="pi pi-user"></i>
                 <p>{{ $t("Wrapped.lone_wolf") }}</p>
               </div>
            </div>

            <!-- Page 8: Outro -->
            <div v-else-if="currentPage === 8" class="page outro-page">
              <h1>{{ $t("Wrapped.outro_title") }}</h1>
              <p>{{ $t("Wrapped.outro_subtitle") }}</p>
            </div>

          </div>
        </Transition>
      </div>

      <div class="navigation-btn next" @click="nextPage" v-if="currentPage < 8">
        <i class="pi pi-chevron-right"></i>
      </div>
    </div>
    
    <div class="pagination-dots" v-if="stats">
        <span 
            v-for="i in 9" 
            :key="i" 
            class="dot" 
            :class="{ active: currentPage === i - 1 }"
            @click="goToPage(i - 1)"
        ></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const store = useStore();
const { games, teams } = storeToRefs(store);

const stats = ref(null);
const loading = ref(true);
const currentPage = ref(0);
const transitionName = ref("slide-right");

function getMonthName(monthIndex) {
    return i18n.t("Common.months_names." + monthIndex);
}

const props = defineProps(["sessions", "id_of_team"]);

onMounted(() => {
    loading.value = true;
    const year = new Date().getFullYear();
    
    // Prepare data for backend (ipcRenderer needs plain objects usually)
    const _sessions = props.sessions
      .map(s => ({
        ...s,
        date: s.date.seconds || s.date, // Ensure timestamp
        game: { id: s.game.id },
        teams: [...s.teams],
        platform: { id: s.platform.id }
    }));
     const _games = games.value.map(g => ({ ...g }));
     const _teams = teams.value.map(t => ({ ...t }));

    const _id_of_team = props.id_of_team.map(t => ({ ...t }));
    
    window.electron.ipcRenderer.send("wrapped_stats", {
        sessions: _sessions,
        games: _games,
        teams: _teams,
        year: year,
        id_of_team: _id_of_team
    });

    window.electron.ipcRenderer.on("result_wrapped_stats", (event, data) => {
        stats.value = data;
        loading.value = false;
        console.log(stats.value);
    });
});

function nextPage() {
    if (currentPage.value < 8) {
        transitionName.value = "slide-left";
        currentPage.value++;
    }
}

function prevPage() {
    if (currentPage.value > 0) {
        transitionName.value = "slide-right";
        currentPage.value--;
    }
}

function goToPage(page) {
    transitionName.value = page > currentPage.value ? "slide-left" : "slide-right";
    currentPage.value = page;
}
</script>

<style scoped>
.wrapped-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 15px;
  color: white;
  overflow: hidden;
  position: relative;
}

.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

.content-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
    width: 100%;
    overflow: hidden;
}

.page-container {
    flex: 1;
    height: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.page-content {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    box-sizing: border-box;
}

.page {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

/* Animations */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}


/* Navigation Buttons */
.navigation-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.2s;
}

.navigation-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.navigation-btn.prev {
    left: 20px;
}

.navigation-btn.next {
    right: 20px;
}

/* Pagination Dots */
.pagination-dots {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding-bottom: 20px;
    z-index: 10;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s;
}

.dot.active {
    background: #fff;
    transform: scale(1.2);
}


/* Page Styles */
h1 {
    font-size: 2.5rem;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
}

h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #e2e8f0;
}

.stat-big .value {
    display: block;
    font-size: 4rem;
    font-weight: bold;
    color: #60a5fa;
}

.stat-medium .value {
    display: block;
    font-size: 3rem;
    font-weight: bold;
    color: #a78bfa;
}

.label {
    font-size: 1.2rem;
    opacity: 0.8;
}

/* Ranking List */
.ranking-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.ranking-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 10px;
}

.rank {
    font-size: 1.5rem;
    font-weight: bold;
    margin-right: 1rem;
    color: #fbbf24;
    width: 40px;
}

.game-info {
    flex: 1;
    display: grid;
    grid-template-columns: 50px 1fr auto;
    align-items: center;
    gap: 0.75rem;
}

.game-name {
    font-weight: bold;
    font-size: 1.2rem;
}

.game-stat {
    opacity: 0.8;
}

.game-logo {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.08);
}

.game-info-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
}

/* Grid Stats */
.grid-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    width: 100%;
}
.grid-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}
.grid-item:last-child {
    grid-column: span 2;
}

/* Fun Stats */
.fun-stats {
    display: flex;
    gap: 2rem;
    width: 100%;
    justify-content: center;
    margin-bottom: 2rem;
}

.fun-item {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.fun-item.positive i { color: #4ade80; font-size: 2rem; }
.fun-item.negative i { color: #f87171; font-size: 2rem; }

.score {
    font-size: 1.5rem;
    font-weight: bold;
}

/* Social */
.friends-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 500px;
}

.friend-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 12px;
    gap: 1rem;
    transition: transform 0.2s;
}

.friend-item:hover {
    transform: translateX(5px);
    background: rgba(255, 255, 255, 0.1);
}

.avatar-placeholder-small {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.friend-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.friend-name-small {
    font-size: 1.2rem;
    font-weight: bold;
}

.friend-stats {
    font-size: 0.9rem;
    opacity: 0.8;
}

.rank-badge {
    font-size: 1.5rem;
}

.intro-icon i {
    font-size: 6rem;
    color: #fbbf24;
    margin-top: 2rem;
    animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.avg-session-stat {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 12px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
