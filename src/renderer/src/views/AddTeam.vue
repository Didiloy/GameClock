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
          <Button label="Ajouter" icon="pi pi-plus" class="btn-add"></Button>
        </div>
      </template>
    </Card>
  </div>
</template>
<script setup>
import { ref } from "vue";
const name = ref("");
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
</style>
