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
                  <a href="https://console.firebase.google.com/"
                    >https://console.firebase.google.com/</a
                  >, authentifier vous avec votre compte Google et créez un
                  projet.
                </li>
                <li>
                  Saisissez le nom de votre projet, désactivez ou pas Google
                  analytics puis cliquez sur <b>créer un projet</b>.
                </li>
                <li>
                  Une fois fait, dans le menu de gauche, sélectionnez
                  <b>Créer</b> et choisissez <b>Realtime Database</b>.
                </li>
                <li>
                  Cliquez sur <b>Créer une base de données</b>, sélectionnez
                  votre emplacement, puis sélectionnez
                  <b>Commencer en mode verrouillé</b>.
                </li>
                <li>
                  Ensuite, sélectionnez de nouveau <b>Créer</b> dans le menu de
                  gauche puis cliquez sur <b>Firestore Database</b>.
                </li>
                <li>
                  Cliquez sur <b>Créer une base de données</b>, choisissez un
                  emplacement <b>Régional</b> de votre choix. Cliquez ensuite
                  sur <b>démarrer en mode production</b>, puis <b>Créer</b>.
                </li>
                <li>
                  Rendez vous dans l'onglet <b>Règles</b> de votre projet et
                  changez le mot <b>false</b> par <b>true</b>.
                </li>
                <li>
                  Enfin pour récupérer les informations demandées, cliquez sur
                  l'engrenage en haut à gauche de votre écran, puis sur
                  <b>Paramètres du projet</b> et ajoutez une application web
                  (celle ayant une icône ressemblant à
                  <i class="pi pi-code"></i>) que vous appelerez comme vous
                  voudrez. Vous pouvez maintenant récupérer toutes les
                  informations demandées sur cette page.
                </li>
              </ol>
            </div>
          </AccordionTab>
        </Accordion>
        <div class="text-input">
          <label for="database_name"
            >Nom de la base de données à votre guise:</label
          >
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
    database.appId
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
  router.go("/");
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
