<template>
  <div class="container">
    <h2>Ajouter une équipe</h2>
    <Card class="card">
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
    <p class="error" v-if="error">
      {{ errorText }}
    </p>
    <p class="success" v-if="succeded">C'est tout bon !</p>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { addTeam } from "../database/database";
const name = ref("");
const error = ref(false);
const errorText = ref("");
const loading = ref(false);
const icon = ref("pi pi-plus");
const succeded = ref(false);
async function onAddTeam() {
  error.value = false;
  if (name.value == "") {
    error.value = true;
    errorText.value = "Vous ne pouvez pas ajouter une équipe sans nom.";
    return;
  }
  loading.value = true;
  let success = await addTeam(name.value);
  if (success) {
    error.value = false;
    errorText.value = "";
    name.value = "";
    icon.value = "pi pi-check";
    succeded.value = true;
  } else {
    error.value = true;
    errorText.value =
      "Une erreur est survenue lors de l'ajout de l'équipe. Une équipe de ce nom existe peut être déjà";
    name.value = "";
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

.error {
  color: red;
}

.success {
  color: green;
}

.title {
  margin-right: 10px;
}
</style>
