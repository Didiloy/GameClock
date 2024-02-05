<template>
  <Card class="lc-container">
    <template #title>
      <div class="lc-center">
        <b><i :class="props.iconName"></i></b>
        <div class="lc-title">
          {{ props.name }}
        </div>
      </div>
    </template>
    <template #content>
      {{ props.value }}
    </template>
  </Card>
</template>
<script setup>
const props = defineProps(["name", "value", "iconName"]);
</script>
<style scoped>
.lc-container {
  width: 100%;
  height: 100%;
  max-height: 200px;
  max-width: 200px;
  background-color: var(--primary-100);
}
.lc-center {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  color: var(--primary-color);
}

.lc-title {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
