<script setup>
import { useStoredDatabases } from "../../store/store";
import { getPreferences, setPreferences } from "../../preferences/preferences";
import { storeToRefs } from "pinia";

import { useI18n } from "vue-i18n";
const i18n = useI18n();

import { useToast } from "primevue/usetoast";
const toast = useToast();

import { useRouter } from "vue-router";
const router = useRouter();
const store = useStoredDatabases();
const { stored_databases } = storeToRefs(store);

function deleteDatabase(name, apiKey, authDomain, index) {
  store.useDeleteDatabase(name, apiKey, authDomain);
  store.loadDatabases();
  setPreferences("selected_database_index", index > 0 ? index - 1 : 0);
  router.go();
}

async function shareDatabase(index) {
  let encoded_string = btoa(JSON.stringify(stored_databases.value[index]));
  try {
    await navigator.clipboard.writeText(encoded_string);
    toast.add({
      severity: "success",
      summary: "",
      detail: i18n.t("AddDatabasePreference.database_copied"),
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddDatabasePreference.database_copied") + encoded_string,
    });
  }
}

function setAsActiveDatabase(index) {
  setPreferences("selected_database_index", index);
  router.go();
}

function goToAddDatabase() {
  router.push("/adddatabase");
}
</script>

<template>
  <div class="tp-container">
    <div class="adp-div-title">
      <span class="tp-title">{{ $t("AddDatabasePreference.databases") }}</span>
      <Button
        :label="i18n.t('AddDatabasePreference.add_database')"
        @click="goToAddDatabase"
      />
    </div>
    <b class="text-color">{{ $t("AddDatabasePreference.active") }}</b>
    <div class="tp-item">
      <h2>
        {{ stored_databases[getPreferences("selected_database_index")].name }}
      </h2>
    </div>
    <b class="text-color" style="margin-top: 10px">{{
      $t("AddDatabasePreference.all_databases")
    }}</b>
    <div
      class="w-100"
      v-for="(database, index) in stored_databases"
      :key="index"
    >
      <div class="tp-item">
        <h2>{{ database.name }}</h2>
        <div>
          <Button
            :label="$t('AddDatabasePreference.set_as_active')"
            style="margin-right: 10px"
            v-if="index !== getPreferences('selected_database_index')"
            @click="setAsActiveDatabase(index)"
          ></Button>
          <Button
            icon="pi pi-share-alt"
            :label="$t('AddDatabasePreference.share')"
            class="p-button-secondary"
            style="margin-right: 10px"
            @click="shareDatabase(index)"
          ></Button>
          <Button
            icon="pi pi-trash"
            :label="$t('AddDatabasePreference.delete')"
            class="p-button-danger"
            @click="
              deleteDatabase(
                database.name,
                database.apiKey,
                database.authDomain,
                index
              )
            "
          ></Button>
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>

<style scoped>
.tp-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  padding-left: 10px;
  margin-bottom: 10px;
}

.text-color {
  color: var(--text-color);
}

.adp-div-title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.tp-title {
  color: var(--primary-500);
  font-weight: bold;
  font-size: 2rem;
}

.w-100 {
  width: 100%;
}

.tp-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  background-color: var(--primary-100);
  border-radius: 10px;
  padding: 0 10px;
}
</style>
