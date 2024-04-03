import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import InputText from "primevue/inputtext";
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
import ProgressBar from 'primevue/progressbar';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Chart from "primevue/chart";
import Dialog from 'primevue/dialog';
import InputSwitch from 'primevue/inputswitch';
import ToggleButton from 'primevue/togglebutton';
import ProgressSpinner from 'primevue/progressspinner';
import OverlayPanel from 'primevue/overlaypanel';
import { createRouter, createWebHashHistory } from "vue-router";
import Home from "./views/Home.vue";
import Teams from "./views/Teams.vue";
import AddTeam from "./views/AddTeam.vue";
import Team from "./views/Team.vue";
import GamesSettings from "./views/GamesSettings.vue";
import { createPinia } from "pinia";
import Settings from "./views/Settings.vue";

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

//Router
const routes = [
  { path: "/", component: Home },
  { path: "/teams", component: Teams },
  { path: "/team/:name", component: Team },
  { path: "/addteam", component: AddTeam },
  { path: "/settings/games", component: GamesSettings },
  { path: "/settings/general", component: Settings },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

app.use(router);

//Pinia
const pinia = createPinia();
app.use(pinia);
app.mount("#app");
