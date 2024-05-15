<template>
  <div class="container">
    <h2>Ajouter une équipe</h2>
    <Card
      class="card"
      :pt="{
        root: { style: 'box-shadow: 0px 0px 0px 0px;' },
        body: { style: 'height:100%; ' },
        content: { style: 'height:100%; ' },
      }"
    >
      <template #content>
        <div class="card-content">
          <div class="form-content">
            <h4 class="title">Nom de l'équipe:</h4>
            <InputText type="text" v-model="name" />
          </div>
          <Button
            label="Ajouter"
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

const store = useStore();
const toast = useToast();
const name = ref("");
const loading = ref(false);
const icon = ref("pi pi-plus");
async function onAddTeam() {
  if (name.value == "") {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Vous ne pouvez pas ajouter une équipe sans nom.",
      life: 3000,
    });
    return;
  }
  if (name.value.includes("/")) {
    toast.add({
      severity: "error",
      summary: "",
      detail: "Vous ne pouvez pas créer une équipe dont le nom contient des /.",
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
      detail: "C'est tout bon !",
      life: 3000,
    });
    await store.reloadStore();
  } else {
    name.value = "";
    toast.add({
      severity: "error",
      summary: "",
      detail:
        "Une erreur est survenue lors de l'ajout de l'équipe. Une équipe de ce nom existe peut être déjà",
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
  justify-content: center;
  height: 100%;
}

.card {
  background-color: var(--primary-100);
  width: 600px;
  margin-top: 70px;
}

.card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-add {
  margin-top: 50px;
}

.title {
  margin-right: 10px;
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
