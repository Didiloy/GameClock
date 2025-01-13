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
        props.historySize === "-1"
          ? $t("SessionsHistory.title_last_days")
          : props.historySize === "-2"
            ? $t("SessionsHistory.title_last_week")
            : props.title
              ? props.title
              : $t("SessionsHistory.title")
      }}</span></template
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
            <Column
              field="name"
              :header="i18n.t('SessionsHistory.game_name')"
              v-once
            >
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
              v-once
            >
              <template #body="slotProps">
                <div class="sh-name">
                  <span>
                    {{ slotProps.data.platform }}
                  </span>
                </div>
              </template>
            </Column>
            <Column
              field="team_name"
              :header="i18n.t('SessionsHistory.team')"
              v-once
            >
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
              v-once
            >
              <template #body="slotProps">
                {{ convertMinuteToHoursMinute(slotProps.data.playtime) }}
              </template>
            </Column>
            <Column
              field="joyrate"
              :header="i18n.t('SessionsHistory.joyrate')"
              v-once
            >
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
            <Column
              field="date"
              :header="i18n.t('SessionsHistory.date')"
              v-once
            >
              <template #body="slotProps">
                <div
                  style="
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                  "
                >
                  {{
                    new Date(
                      slotProps.data.date.seconds * 1000,
                    ).toLocaleDateString()
                  }}
                  <Button
                    :icon="
                      isLiked(slotProps.data.id)
                        ? 'pi pi-heart-fill'
                        : 'pi pi-heart'
                    "
                    severity="danger"
                    text
                    rounded
                    :badge="
                      slotProps.data.likes !== undefined
                        ? slotProps.data.likes.toString()
                        : '0'
                    "
                    badgeSeverity="danger"
                    @click="addLike(slotProps.data)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </AccordionTab>
      </Accordion>
    </template>
  </Card>
  <Toast />
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { convertMinuteToHoursMinute } from "../common/main";
import {
  getIdsOfTeam,
  addLikeToSession,
  removeLikeToSession,
} from "../database/database";
import { getPreferences } from "../preferences/preferences";
import { useToast } from "primevue/usetoast";
import { isLiked, addSession, removeSession } from "../common/likes";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const toast = useToast();
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
const { games, sessions, teams, platforms } = storeToRefs(store);

const sessions_values = ref([]);
const id_of_team = ref([]);
onMounted(() => {
  init();
  if (getPreferences("use_logo_color_in_session_history")) {
    computeSessionColor();
  }
});

watch(
  () => props.teamName,
  () => {
    init();
    if (getPreferences("use_logo_color_in_session_history")) {
      computeSessionColor();
    }
  },
);

// Using Map to store unique games so that we don't compute color multiple time for the same game
const uniqueGames = ref(new Map());

function init() {
  sessions_values.value = [];
  id_of_team.value = getIdsOfTeam(props.teamName, teams.value);

  let session_copy = sessions.value;
  session_copy.sort((a, b) => {
    return b.date.seconds - a.date.seconds;
  });

  if (props.historySize === "-1" || props.historySize === -1) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    session_copy = session_copy.filter(
      (s) => s.date.seconds * 1000 >= today.getTime(),
    );
  } else if (props.historySize === "-2" || props.historySize === -2) {
    let last_week = new Date();
    last_week.setHours(0, 0, 0, 0);
    last_week.setDate(last_week.getDate() - 7);
    session_copy = session_copy.filter(
      (s) => s.date.seconds * 1000 >= last_week.getTime(),
    );
  } else if (props.historySize) {
    session_copy = session_copy.slice(0, props.historySize);
  }

  if (props.teamName !== undefined) {
    //if we are in a team page
    for (let s of session_copy) {
      if (s.teams.some((team) => id_of_team.value.includes(team))) {
        let team_names = [];
        // if we are in a multi team page we keep only the session where all the members played
        if (!id_of_team.value.every((team) => s.teams.includes(team))) {
          continue;
        }
        for (let t of teams.value) {
          if (s.teams.some((team) => t.id === team)) {
            team_names.push(t.name);
          }
        }
        let [game_name, logo] = getGameNameAndLogoById(s.game.id);
        //add the game to the map to compute the color after
        if (!uniqueGames.value.has(game_name)) {
          uniqueGames.value.set(game_name, { logo: logo });
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
          id: s.id,
          team_names: team_names,
          name: game_name,
          playtime: s.duration,
          date: s.date,
          logo: logo,
          joyrate: s.was_cool,
          comment: s.comment,
          likes: s.likes,
          platform: platform_name,
        });
      }
    }
  } else {
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
        id: s.id,
        team_names: team_names,
        name: game_name,
        playtime: s.duration,
        date: s.date,
        logo: logo,
        joyrate: s.was_cool,
        comment: s.comment,
        likes: s.likes,
        platform: platform_name,
      });
    }
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

async function addLike(session) {
  if (!isLiked(session.id)) {
    let added_like = await addLikeToSession(session.id);
    if (added_like) {
      if (session.likes !== undefined) session.likes++;
      else session.likes = 1;
      addSession(session.id);
    } else {
      toast.add({
        severity: "error",
        summary: "",
        detail: i18n.t("SessionsHistory.error_like"),
        life: 3000,
      });
    }
  } else {
    let removed_like = removeLikeToSession(session.id);
    if (removed_like) {
      removeSession(session.id);
      session.likes--;
    } else {
      toast.add({
        severity: "error",
        summary: "",
        detail: i18n.t("SessionsHistory.error_remove_like"),
        life: 3000,
      });
    }
  }
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
  color: v-bind("props.titleColor");
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
