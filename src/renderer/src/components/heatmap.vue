<script setup>
import { onMounted, ref, watch } from "vue";
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
import { CalendarHeatmap } from "vue3-calendar-heatmap";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const props = defineProps([
  "teamName",
  "backgroundColor",
  "titleColor",
  "sessions",
]);
const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";
const store = useStore();
const { games, sessions, teams } = storeToRefs(store);

const loaded = ref(false);
const team_session_transformed = ref([]);
const last_session_date = ref(new Date());
onMounted(() => {
  init();
});

watch(
  () => props.sessions,
  () => {
    init();
  },
);

function init() {
  if (props.sessions) {
    team_session_transformed.value = transformSessions(props.sessions);
    loaded.value = true;
  }
}

function transformSessions(sessions) {
  const result = sessions.reduce((acc, session) => {
    const date = new Date(session.date.seconds * 1000);
    if (date > last_session_date.value) last_session_date.value = date;

    // Normalize the date to exclude hours, minutes, and seconds
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    // Check if the normalized date already exists in the accumulator
    const existingEntry = acc.find(
      (entry) => entry.date.getTime() === normalizedDate.getTime(),
    );

    if (existingEntry) {
      existingEntry.count += session.duration;
    } else {
      acc.push({ date: normalizedDate, count: session.duration });
    }

    return acc;
  }, []);

  return result;
}
</script>

<template>
  <div v-if="!loaded">
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        content: {
          style:
            'height:100%; display: flex; flex-direction: column; justify-content: center; align-items: center;',
        },
      }"
    >
      <template #content>
        <p>{{ $t("Common.loading") }}</p>
      </template>
    </Card>
  </div>
  <div v-else class="container">
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        body: { style: 'height:100%; ' },
        content: {
          style: 'padding: 0px;height:100%;',
        },
      }"
    >
      <template #subtitle>
        <span class="gfp-font">
          {{ $t("Heatmap.title") }}
        </span></template
      >
      <template #content>
        <calendar-heatmap
          :values="team_session_transformed"
          :end-date="last_session_date"
          :no-data-text="i18n.t('Heatmap.no_data')"
          :tooltip-unit="i18n.t('Heatmap.tooltip_unit')"
          :max="300"
          class="dt-heatmap"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.card {
  background-color: v-bind("backgroundColor");
  width: 100%;
  height: 100%;
  border-radius: 30px;
}

@font-face {
  font-family: sephir;
  src: url("../assets/fonts/sephir/sephir.otf");
}

.gfp-font {
  font-family: sephir, serif;
  font-size: 1.5rem;
  font-weight: bold;
  color: v-bind("props.titleColor");
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
