<template>
  <Card
    class="sh-container"
    :pt="{
      root: { style: 'box-shadow: 0px 0px 0px 0px;' },
      body: { style: 'height:100%; ' },
      content: { style: 'height:100%; ' },
    }"
  >
    <template #subtitle
      ><span class="sh-font">{{ $t("SessionsHistory.title") }}</span></template
    >
    <template #content>
      <Accordion>
        <AccordionTab :header="i18n.t('SessionsHistory.sessions')">
          <DataTable
            :value="sessions_values"
            stripedRows
            tableStyle="min-width: 50rem"
            :rowStyle="
              ({ gradient_color }) =>
                gradient_color &&
                'background: linear-gradient(to left, ' +
                  gradient_color +
                  ', white 70%);'
            "
          >
            <Column field="name" :header="i18n.t('SessionsHistory.game_name')">
              <template #body="slotProps">
                <div class="sh-name">
                  <img
                    v-if="slotProps.data.logo"
                    :src="slotProps.data.logo"
                    style="width: 50px; height: auto; border-radius: 5px"
                  />
                  <span>
                    {{
                      slotProps.data.name.length > 20 &&
                      !slotProps.data.name.includes(" ")
                        ? slotProps.data.name.substring(0, 20) + "..."
                        : slotProps.data.name
                    }}
                  </span>
                </div>
              </template>
            </Column>
            <Column
              field="platform"
              :header="i18n.t('SessionsHistory.platform')"
            >
              <template #body="slotProps">
                <div class="sh-name">
                  <span>
                    {{ slotProps.data.platform }}
                  </span>
                </div>
              </template>
            </Column>
            <Column field="team_name" :header="i18n.t('SessionsHistory.team')">
              <template #body="slotProps">
                <div class="sh-chips-team">
                  <Chip
                    v-for="(item, index) in slotProps.data.team_names"
                    :key="index"
                    :label="item"
                    class="sh-chips-team-item"
                    @click="$router.push('/team/' + item)"
                    :pt="{
                      root: {
                        style:
                          'margin-right: 5px; margin-top: 5px; height: 24px; font-size: 14px;',
                      },
                    }"
                  />
                </div>
              </template>
            </Column>
            <Column
              field="playtime"
              :header="i18n.t('SessionsHistory.session_duration')"
            >
              <template #body="slotProps">
                {{ convertMinuteToHoursMinute(slotProps.data.playtime) }}
              </template>
            </Column>
            <Column field="joyrate" :header="i18n.t('SessionsHistory.joyrate')">
              <template #body="slotProps">
                <div class="sh-hover-div">
                  <div v-if="slotProps.data.comment" class="sh-popup">
                    {{ slotProps.data.comment }}
                  </div>
                  <Chip
                    :label="
                      slotProps.data.joyrate == null
                        ? i18n.t('SessionsHistory.neutral')
                        : slotProps.data.joyrate === true
                          ? i18n.t('SessionsHistory.good')
                          : i18n.t('SessionsHistory.bad')
                    "
                    :class="
                      slotProps.data.joyrate == null
                        ? 'c-neutral'
                        : slotProps.data.joyrate === true
                          ? 'c-good'
                          : 'c-bad'
                    "
                  />
                  <i
                    v-if="slotProps.data.comment"
                    class="pi pi-comment"
                    style="margin-left: 5px"
                  />
                </div>
              </template>
            </Column>
            <Column field="date" :header="i18n.t('SessionsHistory.date')">
              <template #body="slotProps">
                <div>
                  {{
                    new Date(
                      slotProps.data.date.seconds * 1000,
                    ).toLocaleDateString()
                  }}
                </div>
              </template>
            </Column>
          </DataTable>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import { getPreferences } from "../preferences/preferences";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const props = defineProps(["sessions"]);
const store = useStore();
const { games, teams, platforms } = storeToRefs(store);

const sessions_values = ref([]);
onMounted(() => {
  init();
  if (getPreferences("use_logo_color_in_session_history")) {
    computeSessionColor();
  }
});

watch(
  () => props.sessions,
  () => {
    init();
  },
);

// Using Map to store unique games so that we don't compute color multiple time for the same game
const uniqueGames = ref(new Map());

function init() {
  sessions_values.value = [];

  let session_copy = props.sessions;
  session_copy.sort((a, b) => {
    return b.date.seconds - a.date.seconds;
  });

  for (let s of session_copy) {
    let [game_name, logo] = getGameNameAndLogoById(s.game.id);
    //add the game to the map to compute the color after
    if (!uniqueGames.value.has(game_name)) {
      uniqueGames.value.set(game_name, { logo: logo });
    }
    let team_names = [];
    for (let t of teams.value) {
      if (s.teams.some((team) => t.id === team)) {
        team_names.push(t.name);
      }
    }

    let platform_name;
    for (let p of platforms.value) {
      if (!s.platform) {
        platform_name = i18n.t("Platform.Not specified");
        continue;
      }
      if (s.platform.id === p.id) {
        platform_name = p.name;
      }
    }

    sessions_values.value.push({
      team_names: team_names,
      name: game_name,
      playtime: s.duration,
      date: s.date,
      logo: logo,
      joyrate: s.was_cool,
      comment: s.comment,
      platform: platform_name,
    });
  }
}

function computeSessionColor() {
  let id = 0;
  for (let [game, data] of uniqueGames.value) {
    const worker = new Worker(
      new URL("../workers/colorWorker.js", import.meta.url),
      { type: "module" },
    );

    worker.onmessage = (event) => {
      const { logo, color, error } = event.data;

      if (error) {
        console.log(`Error processing logo ${logo}: ${error}`);
        worker.terminate();
        return;
      }

      uniqueGames.value.set(game, { logo, color });
      setColorOfGamesSession(game, color);
      worker.terminate();
    };

    worker.onerror = (error) => {
      console.log(`Worker error: ${error.message}`);
      worker.terminate();
    };

    if (data.logo !== undefined && data.logo !== "")
      worker.postMessage({ logo: data.logo, id: id });
    else worker.terminate();
    id++;
  }
}

function setColorOfGamesSession(game, color) {
  for (let session of sessions_values.value) {
    if (session.name === game) {
      session.gradient_color = color;
    }
  }
}

function getGameNameAndLogoById(id) {
  for (let g of games.value) {
    if (id === g.id) return [g.name, g.logo];
  }
  return ["[" + i18n.t("SessionsHistory.deleted_game") + "]", ""];
}
</script>
<style scoped>
.sh-container {
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

.sh-name {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
}

.sh-name > span {
  margin-left: 5px;
}

@font-face {
  font-family: sephir;
  src: url("../assets/fonts/sephir/sephir.otf");
}

.sh-chips-team {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  flex-wrap: wrap;
}

.sh-chips-team-item:hover {
  cursor: pointer;
  background-color: var(--primary-300);
  color: black;
}

.sh-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: whitesmoke;
}

.c-neutral {
  background-color: var(--yellow-100);
}

.c-good {
  background-color: var(--green-100);
}

.c-bad {
  background-color: var(--red-100);
}

.sh-hover-div {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.sh-hover-div .sh-popup {
  visibility: hidden;
  background-color: var(--primary-100);
  color: var(--text-color);
  text-align: center;
  width: 350px;
  border-radius: 5px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  top: auto;
  left: auto;
  right: 20%;
  bottom: auto;
  opacity: 0;
  transition: opacity 0.3s;
}

.sh-hover-div:hover .sh-popup {
  visibility: visible;
  opacity: 1;
}

.sh-popup::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}
</style>
