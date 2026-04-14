<script setup>
import { ref } from "vue";
import { useStore } from "../../store/store";
import { storeToRefs } from "pinia";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

const store = useStore();
const { teams, games, sessions, platforms } = storeToRefs(store);

const toast = useToast();
const i18n = useI18n();
const loading = ref(false);

function exportData() {
  loading.value = true;

  const _sessions = sessions.value.map((s) => ({
    id: s.id,
    duration: s.duration,
    date: s.date.seconds || s.date,
    game: { id: s.game.id },
    teams: [...s.teams],
    platform: { id: s.platform?.id ?? null },
    comment: s.comment,
    was_cool: s.was_cool,
  }));

  const _games = games.value.map((g) => ({ ...g }));
  const _platforms = platforms.value.map((p) => ({ ...p }));
  const _teams = teams.value.map((t) => ({ ...t }));

  window.electron.ipcRenderer.send("export_data", {
    sessions: _sessions,
    games: _games,
    platforms: _platforms,
    teams: _teams,
  });
  window.electron.ipcRenderer.once("result_export_data", (event, data) => {
    loading.value = false;
    if (data.success) {
      toast.add({
        severity: "success",
        summary: "",
        detail: i18n.t("DataExportPreference.success"),
        life: 3000,
      });
    } else if (!data.cancelled) {
      toast.add({
        severity: "error",
        summary: "",
        detail: i18n.t("DataExportPreference.error"),
        life: 3000,
      });
    }
  });
}
</script>

<template>
  <div class="tp-container">
    <h2 class="tp-title">{{ $t("DataExportPreference.title") }}</h2>
    <div class="tp-item">
      <b class="text-color">{{ $t("DataExportPreference.export_description") }}</b>
      <Button
        :label="$t('DataExportPreference.export_button')"
        icon="pi pi-download"
        @click="exportData"
        :loading="loading"
      />
    </div>
  </div>
</template>

<style scoped>
.tp-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

.text-color {
  color: var(--text-color);
}

.tp-title {
  color: var(--primary-500);
}

.tp-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
</style>
