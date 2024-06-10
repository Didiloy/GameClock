<template>
  <div class="loading-container">
    <h3>{{ msg }}</h3>
    <ProgressSpinner />
  </div>
</template>
<script setup>
const { msg } = defineProps(["msg"]);
</script>
<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: center;
  height: 50vh;
  width: 100%;
}

h3 {
  color: #5a5d9d;
  font-size: 2rem;
}
</style>
