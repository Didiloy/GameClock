<script setup>
import Sessions from "../components/waiting_list/Sessions.vue";

const emit = defineEmits(["toggleChronoListener"]);
function toggleChronoListener() {
  emit("toggleChronoListener");
}

import { useI18n } from "vue-i18n";
const i18n = useI18n();

import { useStore, useStoreWaitingList } from "../store/store";
import { storeToRefs } from "pinia";
import AddSession from "../components/AddSession.vue";
import { ref } from "vue";
import { addSession } from "../database/database";
import { getPreferences } from "../preferences/preferences";
const store = useStoreWaitingList();
const { waiting_list } = storeToRefs(store);

import { useToast } from "primevue/usetoast";
const toast = useToast();

const add_session_dialog_visible = ref(false);

const loading = ref(false);

function addNewSessionToList() {
  add_session_dialog_visible.value = true;
}

async function synchronizeWithDatabase() {
  if (!navigator.onLine) {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddSession.errors.unexpected_error"),
      life: 3000,
    });
    return;
  }

  loading.value = true;
  for (const session of waiting_list.value) {
    let success = await addSession(
      session.teamsId,
      session.gameName,
      parseInt(session.duration),
      session.was_cool,
      session.comment,
      session.platform,
      session.date,
    );
    if (success) {
      store.deleteSession(session);
      toast.add({
        severity: "success",
        summary: "",
        detail: i18n.t("AddSession.all_good"),
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "",
        detail: i18n.t("AddSession.errors.unexpected_error"),
        life: 3000,
      });
    }
  }

  loading.value = false;
  if (getPreferences("reload_data_after_adding_session")) {
    setTimeout(async () => {
      await useStore().reloadStore();
    }, 3000);
  }
}
</script>

<template>
  <div class="wls-container">
    <div class="wls-top-row">
      <Button
        :label="i18n.t('WaitingListSession.add_session_to_list')"
        icon="pi pi-plus"
        class="btn-add"
        @click="addNewSessionToList"
      ></Button>
      <Button
        :label="i18n.t('WaitingListSession.synchronize_with_database')"
        icon="pi pi-refresh"
        class="btn-add"
        :loading="loading"
        @click="synchronizeWithDatabase"
      ></Button>
    </div>
    <div class="wls-content">
      <Sessions />
    </div>
    <Dialog
      v-model:visible="add_session_dialog_visible"
      modal
      dismissableMask
      closeOnEscape
      :closable="false"
      :showHeader="false"
      :pt="{
        content: {
          style:
            'height: 600px; width: 800px; border-radius: 15px; margin: 0; padding: 0;',
        },
      }"
    >
      <AddSession
        teamName=""
        :add-to-waiting-list="true"
        @toggleChronoListener="toggleChronoListener"
      ></AddSession>
    </Dialog>
    <Toast />
  </div>
</template>

<style scoped>
.wls-container {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  height: 95%;
  width: 100%;
}

.wls-top-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 95%;
}

.wls-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 95%;
  height: 90%;
  margin: 15px;
}
</style>
