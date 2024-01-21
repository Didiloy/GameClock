<template>
  <div class="container">
    <h2>{{ $route.params.name }}</h2>
  </div>
</template>

<script setup></script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
