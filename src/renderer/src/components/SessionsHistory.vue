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
      ><span class="sh-font">{{
        props.title ? props.title : "Historique des sessions"
      }}</span></template
    >
    <template #content>
      <Accordion>
        <AccordionTab header="Sessions">
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
            <Column field="name" header="Nom du jeu" v-once>
              <template #body="slotProps">
                <div class="sh-name">
                  <img
                    v-if="slotProps.data.logo"
                    :src="slotProps.data.logo"
                    style="width: 50px; height: auto; border-radius: 5px"
                  />
                  <span>
                    {{ slotProps.data.name }}
                  </span>
                </div>
              </template>
            </Column>
            <Column
              v-if="
                props.teamName === undefined || props.teamName.includes(',')
              "
              field="team_name"
              header="Équipe"
              v-once
            >
              <template #body="slotProps">
                <RouterLink
                  :to="'/team/' + slotProps.data.team_name"
                  style="color: var(--primary-500)"
                  >{{ slotProps.data.team_name }}</RouterLink
                >
              </template>
            </Column>
            <Column field="playtime" header="Durée de la session" v-once>
              <template #body="slotProps">
                {{ convertMinuteToHoursMinute(slotProps.data.playtime) }}
              </template>
            </Column>
            <Column field="joyrate" header="Bonheur" v-once>
              <template #body="slotProps">
                <Chip
                  :label="
                    slotProps.data.joyrate == null
                      ? 'Neutre'
                      : slotProps.data.joyrate === true
                        ? 'Bien'
                        : 'Nul'
                  "
                  :class="
                    slotProps.data.joyrate == null
                      ? 'c-neutral'
                      : slotProps.data.joyrate === true
                        ? 'c-good'
                        : 'c-bad'
                  "
                />
              </template>
            </Column>
            <Column field="date" header="Date" v-once>
              <template #body="slotProps">
                <div>
                  {{
                    new Date(
                      slotProps.data.date.seconds * 1000
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
import {
  convertMinuteToHoursMinute,
  getMostDominantColor,
} from "../common/main";
import { getIdsOfTeam } from "../database/database";
import { getPreferences } from "../preferences/preferences";

const props = defineProps([
  "teamName",
  "backgroundColor",
  "titleColor",
  "historySize",
  "title",
]);
const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);

const sessions_values = ref([]);
const id_of_team = ref([]);
onMounted(async () => {
  await init();
  if (getPreferences("use_logo_color_in_session_history")) {
    await computeSessionColor();
  }
});

watch([sessions], async () => {
  await init();
  if (getPreferences("use_logo_color_in_session_history")) {
    await computeSessionColor();
  }
});

// Using Map to store unique games so that we don't compute color multiple time for the same game
const uniqueGames = ref(new Map());

async function init() {
  sessions_values.value = [];
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);

  if (props.teamName !== undefined) {
    //if we are in a team page
    for (let s of sessions.value) {
      if (id_of_team.value.includes(s.team.id)) {
        let team_name;
        if (props.teamName.includes(",")) {
          // if we are in a multi team page
          for (let t of teams.value) {
            if (s.team.id === t.id) {
              team_name = t.name;
            }
          }
        }
        let [game_name, logo] = getGameNameAndLogoById(s.game.id);
        //add the game to the map to compute the color after
        if (!uniqueGames.value.has(game_name)) {
          uniqueGames.value.set(game_name, { logo: logo });
        }

        sessions_values.value.push({
          team_name: team_name,
          name: game_name,
          playtime: s.duration,
          date: s.date,
          logo: logo,
          joyrate: s.was_cool,
        });
      }
    }
  } else {
    for (let s of sessions.value) {
      let [game_name, logo] = getGameNameAndLogoById(s.game.id);
      //add the game to the map to compute the color after
      if (!uniqueGames.value.has(game_name)) {
        uniqueGames.value.set(game_name, { logo: logo });
      }
      let team_name;
      for (let t of teams.value) {
        if (s.team.id === t.id) {
          team_name = t.name;
        }
      }
      sessions_values.value.push({
        team_name: team_name,
        name: game_name,
        playtime: s.duration,
        date: s.date,
        logo: logo,
        joyrate: s.was_cool,
      });
    }
  }

  sessions_values.value.sort((a, b) => {
    return b.date.seconds - a.date.seconds;
  });

  if (props.historySize) {
    sessions_values.value = sessions_values.value.slice(0, props.historySize);
  }
}

async function computeSessionColor() {
  for (let [game, data] of uniqueGames.value) {
    const worker = new Worker(
      new URL("../workers/colorWorker.js", import.meta.url)
    );

    worker.onmessage = (event) => {
      const { logo, color, error } = event.data;

      if (error) {
        console.error(`Error processing logo ${logo}: ${error}`);
        return;
      }

      uniqueGames.value.set(game, { logo, color });
      setColorOfGamesSession(game, color);
    };

    worker.onerror = (error) => {
      console.error(`Worker error: ${error.message}`);
      reject(error);
    };

    if (data.logo !== undefined && data.logo !== "")
      worker.postMessage({ logo: data.logo, transparency: 0.4 });
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
  return ["[Jeu supprimé ou introuvable]", ""];
}
</script>
<style scoped>
.sh-container {
  background-color: v-bind("backgroundColor");
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

.sh-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: v-bind("props.titleColor");
}

.c-neutral {
  background-color: var(--primary-100);
}

.c-good {
  background-color: var(--green-100);
}

.c-bad {
  background-color: var(--red-100);
}
</style>
