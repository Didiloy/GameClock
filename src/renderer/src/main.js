import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import PrimeVue from "primevue/config";
import App from "./App.vue";
// import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import Menu from "primevue/menu";
import Sidebar from "primevue/sidebar";
import Divider from "primevue/divider";
import Image from "primevue/image";
import DataTable from "primevue/datatable";
import DataView from "primevue/dataview";
import Column from "primevue/column";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import ColumnGroup from "primevue/columngroup"; // optional
import Row from "primevue/row";
import Card from "primevue/card";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import SelectButton from "primevue/selectbutton";
import AutoComplete from "primevue/autocomplete";
import Chip from "primevue/chip";
import ProgressBar from "primevue/progressbar";
import Checkbox from "primevue/checkbox";
import Dropdown from "primevue/dropdown";
import Chart from "primevue/chart";
import Dialog from "primevue/dialog";
import InputSwitch from "primevue/inputswitch";
import MultiSelect from "primevue/multiselect";
import Chips from "primevue/chips";
import ToggleButton from "primevue/togglebutton";
import ProgressSpinner from "primevue/progressspinner";
import ContextMenu from "primevue/contextmenu";
import OverlayPanel from "primevue/overlaypanel";
import Message from "primevue/message";
import { createRouter, createWebHashHistory } from "vue-router";
const Home = () => import("./views/Home.vue");
const Teams = () => import("./views/Teams.vue");
const AddTeam = () => import("./views/AddTeam.vue");
const Team = () => import("./views/Team.vue");
const GamesSettings = () => import("./views/GamesSettings.vue");
const GameDetails = () => import("./views/GameDetails.vue");
import { createPinia, storeToRefs } from "pinia";
const Settings = () => import("./views/Settings.vue");
import AddDatabaseForFirstTime from "./views/AddDatabaseForFirstTime.vue";
import { useStoredDatabases, useStore } from "./store/store";
const DatabaseSettings = () => import("./views/DatabaseSettings.vue");
const DatabaseError = () => import("./components/DatabaseError.vue");
const WaitingListSession = () => import("./views/WaitingListSession.vue");
const SearchSessions = () => import("./views/SearchSessions.vue");

const app = createApp(App);

//PrimeVue
app.use(PrimeVue);
app.component("InputText", InputText);
app.component("InputNumber", InputNumber);
app.component("SelectButton", SelectButton);
app.component("Button", Button);
app.component("Toast", Toast);
app.use(ToastService);
app.component("Menu", Menu);
app.component("Sidebar", Sidebar);
app.component("Divider", Divider);
app.component("Image", Image);
app.component("DataTable", DataTable);
app.component("DataView", DataView);
app.component("Column", Column);
app.component("ColumnGroup", ColumnGroup);
app.component("Row", Row);
app.component("Card", Card);
app.component("Accordion", Accordion);
app.component("AccordionTab", AccordionTab);
app.component("AutoComplete", AutoComplete);
app.component("Chart", Chart);
app.component("TabView", TabView);
app.component("TabPanel", TabPanel);
app.component("ProgressBar", ProgressBar);
app.component("ProgressSpinner", ProgressSpinner);
app.component("Dialog", Dialog);
app.component("ToggleButton", ToggleButton);
app.component("Checkbox", Checkbox);
app.component("OverlayPanel", OverlayPanel);
app.component("Chip", Chip);
app.component("Dropdown", Dropdown);
app.component("InputSwitch", InputSwitch);
app.component("Message", Message);
app.component("ContextMenu", ContextMenu);
app.component("TextArea", Textarea);
app.component("Chips", Chips);
app.component("MultiSelect", MultiSelect);

//Pinia
const pinia = createPinia();
app.use(pinia);

//Router
const routes = [
  { path: "/", component: Home, name: "home" },
  { path: "/teams", component: Teams, name: "teams" },
  { path: "/team/:name", component: Team, props: true },
  { path: "/team/:name/:game", component: Team },
  { path: "/addteam", component: AddTeam },
  {
    path: "/search-sessions",
    component: SearchSessions,
    name: "search-sessions",
  },
  { path: "/settings/games", component: GamesSettings, name: "settings-games" },
  {
    path: "/settings/games/:id",
    component: GameDetails,
    name: "settings-games-details",
    props: true,
  },
  { path: "/settings/general", component: Settings, name: "settings-general" },
  {
    path: "/waiting-list-sessions",
    component: WaitingListSession,
    name: "waiting-list-sessions",
  },
  {
    path: "/settings/databases",
    component: DatabaseSettings,
    name: "settings-databases",
  },
  { path: "/database-error", component: DatabaseError, name: "database-error" },
  {
    path: "/adddatabase",
    component: AddDatabaseForFirstTime,
    name: "adddatabase",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

const storeDatabases = useStoredDatabases();
const { stored_databases } = storeToRefs(storeDatabases);

import { initialiseFirebase } from "./database/firebaseConfig";
//if the user don't have databases he must add one else we initialise the firebase database
if (stored_databases.value.length === 0) {
  router.push("/adddatabase");
} else {
  initialiseFirebase(
    stored_databases,
    getPreferences("selected_database_index"),
  );
}

const store = useStore();
const { store_error } = storeToRefs(store);

//if we don't have databases we can only go to add database
router.beforeEach((to) => {
  if (to.name !== "adddatabase" && stored_databases.value.length === 0) {
    // redirect the user to the adddatabase page
    return { name: "adddatabase" };
  }
});

//if the database isn't accessible we can still change databases and see our parameters and add sessions to the waiting list
router.beforeEach((to, from) => {
  if (
    store_error.value !== undefined &&
    store_error.value !== "" &&
    to.name !== "database-error"
  ) {
    if (from.name === "database-error") {
      if (
        to.name !== "settings-general" &&
        to.name !== "settings-databases" &&
        to.name !== "waiting-list-sessions"
      )
        return false;
    }

    if (from.name === "settings-databases") {
      if (to.name !== "settings-general" && to.name !== "waiting-list-sessions")
        return false;
    }

    if (from.name === "settings-general") {
      if (
        to.name !== "settings-databases" &&
        to.name !== "waiting-list-sessions"
      )
        return false;
    }

    if (from.name === "waiting-list-sessions") {
      if (to.name !== "settings-general" && to.name !== "settings-databases")
        return false;
    }
  }
});

app.use(router);

//Translations
import translations from "./i18n/i18n.json";
import { getPreferences } from "./preferences/preferences";
import { getGames } from "./database/database";
const i18n = createI18n({
  legacy: false,
  locale: getPreferences("language"),
  fallbackLocale: "en",
  messages: translations,
});
app.use(i18n);

app.mount("#app");
