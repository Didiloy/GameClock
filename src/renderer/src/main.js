import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import Menu from "primevue/menu";
import Sidebar from "primevue/sidebar";
import Divider from "primevue/divider";
import Image from "primevue/image";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup"; // optional
import Row from "primevue/row";
import Card from "primevue/card";
import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Teams from "./views/Teams.vue";
import AddTeam from "./views/AddTeam.vue";
import GeneralStats from "./views/GeneralStats.vue";

const app = createApp(App);

//PrimeVue
app.use(PrimeVue);
app.component("InputText", InputText);
app.component("Button", Button);
app.component("Toast", Toast);
app.use(ToastService);
app.component("Menu", Menu);
app.component("Sidebar", Sidebar);
app.component("Divider", Divider);
app.component("Image", Image);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("ColumnGroup", ColumnGroup);
app.component("Row", Row);
app.component("Card", Card);

//Router
const routes = [
  { path: "/", component: Home },
  { path: "/teams", component: Teams },
  { path: "/addteam", component: AddTeam },
  { path: "/stats", component: GeneralStats },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

app.use(router);

app.mount("#app");
