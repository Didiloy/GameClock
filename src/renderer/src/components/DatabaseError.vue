<script setup>
import { useStore } from "../store/store";
import { storeToRefs } from "pinia";
const store = useStore();
const { store_error } = storeToRefs(store);
</script>
<template>
  <div class="content a-center">
    <h4>{{ $t("App.error_loading_data") + store_error }}</h4>
  </div>
</template>
<style>
.a-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.content {
  padding: 5px;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  margin-bottom: 25px;
}
</style>
