<template>
  <div class="loading-container">
    <h2>{{ $t("Loading." + props.msg) }}</h2>
    <ProgressSpinner />
    <h4>{{ detail }}</h4>
  </div>
</template>
<script setup>
import { toRef, toRefs } from "vue";
const props = defineProps(["msg", "detail"]);
const { detail } = toRefs(props);
</script>
<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
}

h2 {
  color: #5a5d9d;
}
</style>
