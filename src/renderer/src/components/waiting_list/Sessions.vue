<script setup>
import { convertMinuteToHoursMinute } from "../../common/main";
import { useI18n } from "vue-i18n";
const i18n = useI18n();

const backgroundColor = "var(--primary-100)";

import { useStore, useStoreWaitingList } from "../../store/store";
import { storeToRefs } from "pinia";
const store_waiting_list = useStoreWaitingList();
const { waiting_list } = storeToRefs(store_waiting_list);
const store = useStore();
const { teams, platforms } = storeToRefs(store);

function getTeamName(id) {
  return teams.value.find((g) => g.id === id).name;
}

function getPlatformName(id) {
  return platforms.value.find((g) => g.id === id).name;
}
</script>

<template>
  <Card
    class="sh-container"
    :pt="{
      root: { style: 'box-shadow: 0px 0px 0px 0px;' },
      body: { style: 'height:100%; ' },
      content: { style: 'height:100%; ' },
    }"
  >
    <template #content>
      <DataTable
        :value="waiting_list"
        stripedRows
        tableStyle="min-width: 50rem"
      >
        <Column
          field="gameName"
          :header="i18n.t('WaitingListSession.Sessions.game_name')"
          v-once
        >
          <template #body="slotProps">
            <div class="sh-name">
              <span>
                {{
                  slotProps.data.gameName.length > 20 &&
                  !slotProps.data.gameName.includes(" ")
                    ? slotProps.data.gameName.substring(0, 20) + "..."
                    : slotProps.data.gameName
                }}
              </span>
            </div>
          </template>
        </Column>
        <Column
          field="platform"
          :header="i18n.t('WaitingListSession.Sessions.platform')"
          v-once
        >
          <template #body="slotProps">
            <div class="sh-name">
              <span>
                {{ getPlatformName(slotProps.data.platform) }}
              </span>
            </div>
          </template>
        </Column>
        <Column
          field="teamId"
          :header="i18n.t('WaitingListSession.Sessions.team_name')"
          v-once
        >
          <template #body="slotProps">
            <div class="sh-chips-team">
              <Chip
                v-for="(item, index) in slotProps.data.teamsId"
                :key="index"
                :label="getTeamName(item)"
                class="sh-chips-team-item"
                @click="$router.push('/team/' + getTeamName(item))"
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
          field="duration"
          :header="i18n.t('WaitingListSession.Sessions.duration')"
          v-once
        >
          <template #body="slotProps">
            {{ convertMinuteToHoursMinute(slotProps.data.duration) }}
          </template>
        </Column>
        <Column
          field="was_cool"
          :header="i18n.t('WaitingListSession.Sessions.joyrate')"
          v-once
        >
          <template #body="slotProps">
            <div class="sh-hover-div">
              <div v-if="slotProps.data.comment" class="sh-popup">
                {{ slotProps.data.comment }}
              </div>
              <Chip
                :label="
                  slotProps.data.was_cool == null
                    ? i18n.t('WaitingListSession.Sessions.neutral')
                    : slotProps.data.was_cool === true
                      ? i18n.t('WaitingListSession.Sessions.fun')
                      : i18n.t('WaitingListSession.Sessions.bad')
                "
                :class="
                  slotProps.data.was_cool == null
                    ? 'c-neutral'
                    : slotProps.data.was_cool === true
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
          :header="i18n.t('WaitingListSession.Sessions.date')"
          v-once
        >
          <template #body="slotProps">
            <div>
              {{ new Date(slotProps.data.date).toLocaleDateString() }}
            </div>
          </template>
        </Column>
        <Column
          field="date"
          :header="i18n.t('WaitingListSession.Sessions.delete')"
          v-once
        >
          <template #body="slotProps">
            <div>
              <Button
                icon="pi pi-trash"
                severity="danger"
                @click="store_waiting_list.deleteSession(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

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

.c-neutral {
  background-color: var(--yellow-100);
}

.c-good {
  background-color: var(--green-100);
}

.c-bad {
  background-color: var(--red-100);
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
