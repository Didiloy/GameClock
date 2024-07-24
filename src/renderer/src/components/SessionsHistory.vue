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
      <Accordion class="">
        <AccordionTab header="Sessions">
          <DataTable
            :value="sessions_values"
            stripedRows
            tableStyle="min-width: 50rem"
            :rowStyle="({gradient_color}) => gradient_color && 'background: linear-gradient(to left, ' + gradient_color + ', white 70%);'"
          >
            <Column field="name" header="Nom du jeu">
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
              v-if="props.teamName === undefined"
              field="team_name"
              header="Équipe"
            >
              <template #body="slotProps">
                <RouterLink
                  :to="'/team/' + slotProps.data.team_name"
                  style="color: var(--primary-500)"
                  >{{ slotProps.data.team_name }}</RouterLink
                >
              </template>
            </Column>
            <Column field="playtime" header="Durée de la session">
              <template #body="slotProps">
                {{ convertMinuteToHoursMinute(slotProps.data.playtime) }}
              </template>
            </Column>
            <Column field="joyrate" header="Bonheur">
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
            <Column field="date" header="Date">
              <template #body="slotProps">
                <div
                >
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
import {convertMinuteToHoursMinute, getMostDominantColor} from "../common/main";
import { getIdOfTeam } from "../database/database";
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
const id_of_team = ref("");
onMounted(async () => {
  await init();
});

watch([sessions], async () => {
  await init();
});

async function init() {
  sessions_values.value = [];
  id_of_team.value = getIdOfTeam(props.teamName, teams.value);

  if (props.teamName !== undefined) {
    for (let s of sessions.value) {
      if (s.team.id === id_of_team.value) {
        let [game_name, logo] = getGameNameAndLogoById(s.game.id);
        sessions_values.value.push({
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

  if(getPreferences("use_logo_color_in_session_history")) {
    for (let s of sessions_values.value) {
      s.gradient_color = await getMostDominantColor(s.logo, 0.4);
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
