<template>
  <div class="container" v-once>
    <h2>{{ $t("AddTeam.add_team") }}</h2>
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px; border-radius: 15px;' },
        body: { style: 'height:100%; ' },
        content: { style: 'height:100%; ' },
      }"
    >
      <template #content>
        <div class="card-content">
          <InputText
            type="text"
            v-model="name"
            :placeholder="$t('AddTeam.team_name')"
            @focus="emit('toggleChronoListener')" 
            @blur="emit('toggleChronoListener')"
          />
          <Button
            :label="$t('AddTeam.add')"
            :icon="icon"
            class="btn-add"
            @click="onAddTeam"
            :loading="loading"
          ></Button>
        </div>
      </template>
    </Card>
    <Toast />
  </div>
</template>
<script setup>
import { ref } from "vue";
import { addTeam } from "../database/database";
import { useToast } from "primevue/usetoast";
import { useStore } from "../store/store";
const emit = defineEmits(["toggleChronoListener"]);


const store = useStore();
const toast = useToast();

import { useI18n } from "vue-i18n";
const i18n = useI18n();

const name = ref("");
const loading = ref(false);
const icon = ref("pi pi-plus");

async function onAddTeam() {
  if (name.value === "") {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddTeam.errors.no_empty_field"),
      life: 3000,
    });
    return;
  }
  if (name.value.includes("/") || name.value.includes(",")) {
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddTeam.errors.no_slashes_or_commas"),
      life: 3000,
    });
    return;
  }
  loading.value = true;
  let success = await addTeam(name.value);
  if (success) {
    name.value = "";
    icon.value = "pi pi-check";
    toast.add({
      severity: "success",
      summary: "",
      detail: i18n.t("AddTeam.all_good"),
      life: 3000,
    });
    await store.reloadStore();
  } else {
    name.value = "";
    toast.add({
      severity: "error",
      summary: "",
      detail: i18n.t("AddTeam.errors.an_error_happened"),
      life: 3000,
    });
  }
  loading.value = false;
}
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  height: 100%;
}

.card {
  background-color: var(--primary-100);
  width: 600px;
  margin-top: 70px;
}

.card-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.btn-add {
  margin-left: 15px;
}

@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

h2 {
  color: #5a5d9d;
  font-family: dishcek, serif;
  font-size: 2.5rem;
  display: inline;
  margin: 0;
}
</style>
