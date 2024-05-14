<template>
  <div class="container">
    <h2 class="s-title">Ajouter une base de données</h2>
    <Message
      :closable="false"
      style="display: inline-block; width: 100%; text-align: center"
      >Vous n'avez pas encore de base de données. Vous devez en ajouter une pour
      continuer.</Message
    >
    <div class="import-db-elem-container">
      <div class="elem-container">
        <h2 class="elem-title">Importer une base de données</h2>
        <p class="text-color">
          Vous pouvez demander à vos amis de vous partager leur base de données.
          Il ne vous restera plus qu'à copier le texte et le coller dans le
          champs ci-dessous !
        </p>
        <div class="elem-item">
          <InputText type="text" v-model="import_string" style="width: 70%" />
          <Button label="Importer" icon="pi pi-check" @click="importDatabase" />
        </div>
      </div>
    </div>
    <Divider />
    <div class="add-db-elem-container">
      <div class="elem-container">
        <h2 class="elem-title">Ajouter une nouvelle base de données</h2>
        <Accordion class="accordion-tab">
          <AccordionTab
            class="accordion-tab"
            header="Instructions pour créer une base de données"
          >
            <div class="accordion-tab">
              <p>GameClock utilise des bases de données Firebase Firestore.</p>
              <ol>
                <li>
                  Pour créer votre base de données rendez-vous sur
                  <a
                    href="https://console.cloud.google.com/firestore/databases?hl=fr"
                    >firebase</a
                  >, authentifier vous avec votre compte Google et créez un
                  projet.
                </li>
                <li>
                  Cliquez sur <b>Créer une base de données</b>, choisissez le
                  <b>mode natif</b>, cliquez sur continuer puis remplisser avec
                  les valeurs qui vous conviennent.
                </li>
                <li>
                  Une fois la base de données créée, il faudra se rendre dans
                  <b>Règles de sécurité</b> puis cliquer sur
                  <b>Activer firebase</b>.
                </li>
                <li>
                  Allez sur votre console Cloud Firestore puis sélectionnez
                  votre nouveau projet.
                </li>
                <li>
                  Allez dans l'onglet <b>règles</b> et remplacez le
                  <b>false</b> par <b>true</b>.
                </li>
                <li>
                  Allez sur la page du projet que vous avez créé puis cliquez
                  sur l'icone de paramètres à côté de "vue d'ensemble du projet"
                  ensuite cliquez sur "parametre du projet".
                </li>
                <li>
                  Cliquez sur <b>ajouter une application</b> et copiez les
                  valeurs demandées plus bas sans les guillemets.
                </li>
              </ol>
            </div>
          </AccordionTab>
        </Accordion>
        <div class="text-input">
          <label for="database_name">Nom de la base de données:</label>
          <InputText
            id="database_name"
            v-model="database_name"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_api_key">Clé d'API:</label>
          <InputText
            id="database_api_key"
            v-model="database_api_key"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_auth_domain">Domaine d'authentification:</label>
          <InputText
            id="database_auth_domain"
            v-model="database_auth_domain"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_url">URL de la base de données:</label>
          <InputText
            id="database_url"
            v-model="database_url"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_id">Id du projet:</label>
          <InputText
            id="database_id"
            v-model="database_id"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_storage_bucket">storageBucket:</label>
          <InputText
            id="database_storage_bucket"
            v-model="database_storage_bucket"
            style="width: 70%"
          />
        </div>
        <div class="text-input">
          <label for="database_messaging_sender_id">messagingSenderId:</label>
          <InputText
            id="database_messaging_sender_id"
            v-model="database_messaging_sender_id"
            style="width: 70%"
          />
        </div>

        <div class="elem-item">
          <div class="text-input">
            <label for="database_app_id">App Id:</label>
            <InputText
              id="database_app_id"
              v-model="database_app_id"
              style="width: 79%"
            />
          </div>
          <Button label="Ajouter" icon="pi pi-check" @click="addNewDatabase" />
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
      detail: "Aucun champ ne doit être vide !",
      life: 3000,
    });
    return;
  }
  //TODO
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
      detail: "Aucun champ ne doit être vide !",
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
    database_app_id.value
  );
  router.push("/");
}
</script>
<style scoped>
.container {
  /* display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start; */
  height: 100%;
  width: 95%;
  margin-bottom: 20px;
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
}

.add-db-elem-container {
  margin-top: 10px;
}

.elem-container {
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
