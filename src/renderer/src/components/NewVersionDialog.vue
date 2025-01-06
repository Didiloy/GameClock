<template>
  <div class="nvd-container"></div>
</template>
<script setup>
import { getLatestReleaseChangelog } from "../common/new_version";
</script>
<style scoped>
.nvd-container {
  width: 100%;
  height: 100%;
  background-color: red;
}
</style>
