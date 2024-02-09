<template>
  <Card class="sh-container">
    <template #subtitle> Historique des sessions </template>
    <template #content>
      <Accordion class="">
        <AccordionTab header="Sessions">
          <DataTable
            :value="sessions_values"
            stripedRows
            tableStyle="min-width: 50rem"
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
            <Column field="playtime" header="Durée de la session">
              <template #body="slotProps">
                {{
                  convertMinuteToHoursMinute(slotProps.data.playtime)
                }}</template
              >
            </Column>
            <Column field="date" header="Date">
              <template #body="slotProps">
                {{
                  new Date(
                    slotProps.data.date.seconds * 1000
                  ).toLocaleDateString()
                }}
              </template></Column
            >
          </DataTable>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const props = defineProps(["teamName"]);
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);

const sessions_values = ref([]);
const id_of_team = ref("");
onMounted(() => {
  init();
});

watch([games, sessions, teams], () => {
  init();
});

function init() {
  for (let t of teams.value) {
    if (t.name == props.teamName) {
      id_of_team.value = t.id;
    }
  }

  for (let s of sessions.value) {
    if (s.team.id == id_of_team.value) {
      let [game_name, logo] = getGameNameAndLogoById(s.game.id);
      sessions_values.value.push({
        name: game_name,
        playtime: s.duration,
        date: s.date,
        logo: logo,
      });
    }
  }
  sessions_values.value.sort((a, b) => {
    return b.date.seconds - a.date.seconds;
  });
}

function getGameNameAndLogoById(id) {
  for (let g of games.value) {
    if (id == g.id) return [g.name, g.logo];
  }
  return ["[Jeu supprimé ou introuvable]", ""];
}

function convertMinuteToHoursMinute(minute) {
  return (
    ((minute - (minute % 60)) / 60 > 0
      ? (minute - (minute % 60)) / 60 + "h"
      : "") +
    (minute % 60 == 0
      ? ""
      : minute % 60 >= 10
        ? (minute % 60) + "min"
        : "0" + (minute % 60) + "min")
  );
}
</script>
<style scoped>
.sh-container {
  width: 100%;
  height: 100%;
  margin-top: 5px;
  background-color: var(--primary-100);
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
</style>
