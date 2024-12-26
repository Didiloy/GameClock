<template>
  <div class="ad-container">
    <h2 class="s-title">{{ $t("AddDatabaseForFirstTime.add_database") }}</h2>
    <Message
      v-if="stored_databases.length === 0"
      :closable="false"
      style="display: inline-block; width: 100%; text-align: center"
      >{{ $t("AddDatabaseForFirstTime.you_have_no_databases") }}</Message
    >
    <div class="import-db-elem-container">
      <div class="elem-container">
        <div class="title-container">
          <h2 class="elem-title">
            {{ $t("AddDatabaseForFirstTime.import_database") }}
          </h2>
          <Dropdown v-model="$i18n.locale" :options="$i18n.availableLocales" />
        </div>
        <p class="text-color">
          {{ $t("AddDatabaseForFirstTime.ask_your_friends") }}
        </p>
        <div class="elem-item">
          <InputText type="text" v-model="import_string" style="width: 70%" />
          <Button
            :label="$t('AddDatabaseForFirstTime.import')"
            icon="pi pi-check"
            @click="importDatabase"
          />
        </div>
      </div>
    </div>
    <Divider />
    <div class="add-db-elem-container">
      <div class="elem-container">
        <h2 class="elem-title">
          {{ $t("AddDatabaseForFirstTime.add_new_database") }}
        </h2>
        <Accordion class="accordion-tab">
          <AccordionTab
            class="accordion-tab"
            :header="
              $t('AddDatabaseForFirstTime.instruction_to_create_database.label')
            "
          >
            <div class="accordion-tab">
              <p>{{ $t("AddDatabaseForFirstTime.gameclock_use_firebase") }}</p>
              <ol>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.first",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.second",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.third",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.fourth",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.fifth",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.sixth",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.seventh",
                    )
                  }}
                </li>
                <li>
                  {{
                    $t(
                      "AddDatabaseForFirstTime.instruction_to_create_database.eighth",
                    )
                  }}
                </li>
              </ol>
            </div>
          </AccordionTab>
        </Accordion>
        <div class="text-input">
          <label for="database_name">{{
            $t("AddDatabaseForFirstTime.database_name")
          }}</label>
          <InputText
            id="database_name"
            v-model="database_name"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_api_key">{{
            $t("AddDatabaseForFirstTime.database_api_key")
          }}</label>
          <InputText
            id="database_api_key"
            v-model="database_api_key"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_auth_domain">{{
            $t("AddDatabaseForFirstTime.database_auth_domain")
          }}</label>
          <InputText
            id="database_auth_domain"
            v-model="database_auth_domain"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_url">{{
            $t("AddDatabaseForFirstTime.database_url")
          }}</label>
          <InputText
            id="database_url"
            v-model="database_url"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_id">{{
            $t("AddDatabaseForFirstTime.database_id")
          }}</label>
          <InputText
            id="database_id"
            v-model="database_id"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_storage_bucket">{{
            $t("AddDatabaseForFirstTime.database_storage_bucket")
          }}</label>
          <InputText
            id="database_storage_bucket"
            v-model="database_storage_bucket"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_messaging_sender_id">{{
            $t("AddDatabaseForFirstTime.database_messaging_sender_id")
          }}</label>
          <InputText
            id="database_messaging_sender_id"
            v-model="database_messaging_sender_id"
            style="width: 70%"
          />
        </div>

        <div class="elem-item">
          <div class="text-input">
            <label for="database_app_id">{{
              $t("AddDatabaseForFirstTime.database_app_id")
            }}</label>
            <InputText
              id="database_app_id"
              v-model="database_app_id"
              style="width: 79%"
            />
          </div>
          <Button
            :label="$t('AddDatabaseForFirstTime.add')"
            icon="pi pi-check"
            @click="addNewDatabase"
          />
        </div>
      </div>
    </div>
    <Toast />
  </div>
</template>
<script setup>
import Accordion from "primevue/accordion";
import { ref } from "vue";
import { addDatabase } from "../database/stored_databases";
import { useRouter } from "vue-router";
const router = useRouter();
import { useToast } from "primevue/usetoast";
const toast = useToast();
import { useI18n } from "vue-i18n";
const i18n = useI18n();
import { storeToRefs } from "pinia";
import { useStoredDatabases } from "../store/store";
const store = useStoredDatabases();
const { stored_databases } = storeToRefs(store);

const import_string = ref("");

const database_name = ref("");
const database_api_key = ref("");
const database_auth_domain = ref("");
const database_url = ref("");
const database_id = ref("");
const database_storage_bucket = ref("");
const database_messaging_sender_id = ref("");
const database_app_id = ref("");

function importDatabase() {
  if (import_string.value === "") {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddDatabaseForFirstTime.errors.no_empty_field"),
      life: 3000,
    });
    return;
  }
  let decoded_string = atob(import_string.value);
  let database = JSON.parse(decoded_string);
  addDatabase(
    database.name,
    database.apiKey,
    database.authDomain,
    database.databaseURL,
    database.projectId,
    database.storageBucket,
    database.messagingSenderId,
    database.appId,
  );
  router.push({ path: "/" }).then(() => {
    router.go();
  });
}

function addNewDatabase() {
  if (
    database_name.value === "" ||
    database_api_key.value === "" ||
    database_auth_domain.value === "" ||
    database_url.value === "" ||
    database_id.value === "" ||
    database_storage_bucket.value === "" ||
    database_messaging_sender_id.value === "" ||
    database_app_id.value === ""
  ) {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddDatabaseForFirstTime.errors.no_empty_field"),
      life: 3000,
    });
    return;
  }
  addDatabase(
    database_name.value,
    database_api_key.value,
    database_auth_domain.value,
    database_url.value,
    database_id.value,
    database_storage_bucket.value,
    database_messaging_sender_id.value,
    database_app_id.value,
  );
  router.go("/");
}
</script>
<style scoped>
.ad-container {
  /* display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start; */
  height: fit-content;
  width: 95%;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

.text-input {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  margin-top: 10px;
}

.s-title {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  margin: 0;
  width: 100%;
  display: inline-block;
  overflow: hidden;
  text-align: center;
}

.import-db-elem-container {
  margin-top: 20px;
  margin-bottom: 50px;
}

.add-db-elem-container {
  margin-top: 10px;
}

.elem-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

.elem-text-color {
  color: var(--text-color);
}

.title-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.elem-title {
  color: var(--primary-500);
}

.elem-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-tab {
  width: 100%;
}
</style>
