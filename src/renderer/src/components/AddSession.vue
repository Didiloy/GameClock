<template>
  <div class="component-container">
    <Card class="card">
      <template #title> Ajouter une session </template>
      <template #content>
        <div class="content-container">
          <div class="left">
            <InputText
              v-model="game"
              placeholder="Nom du jeu"
              class="mb10"
            ></InputText>
            <div class="input-duration">
              <label for="duration" class=""> Durée de la session </label>
              <InputNumber
                id="duration"
                v-model="duration"
                showButtons
                placeholder="Durée"
              ></InputNumber>
            </div>
          </div>
          <div class="right">
            <SelectButton
              v-model="was_cool"
              :options="options_cool"
              optionLabel="name"
              aria-labelledby="basic"
              class="mb10"
            />
            <Button
              label="Ajouter"
              :icon="icon"
              class="btn-add"
              @click=""
              :loading="loading"
            ></Button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
<script setup>
import { ref } from "vue";

const props = defineProps(["teamName"]);
const loading = ref(false);
const icon = ref("pi pi-plus");
const game = ref("");
const duration = ref(0);
const was_cool = ref(true);
const options_cool = ref([
  { name: "C'était cool", value: true },
  { name: "C'était pas cool", value: false },
]);
</script>
<style scoped>
.component-container {
  width: 70vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.input-duration {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.card {
  background-color: var(--primary-100);
  width: 70vw;
}

.content-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
}

.right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
}

.mb10 {
  margin-bottom: 10px;
}
</style>
