<template>
  <Card class="lc-container">
    <template #title> {{ props.name }} </template>
    <template #content>
      {{ props.value }}
    </template>
  </Card>
</template>
<script setup>
const props = defineProps(["name", "value"]);
</script>
<style scoped>
.lc-container {
  width: 100%;
  height: 100%;
  max-height: 200px;
  max-width: 200px;
  background-color: var(--primary-100);
}
</style>
