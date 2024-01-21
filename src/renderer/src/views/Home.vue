<template>
  <div class="container">
    <Image :src="logo" width="250" class="header" />
  </div>
</template>

<script setup>
import logo from "../assets/images/icons.png";
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
