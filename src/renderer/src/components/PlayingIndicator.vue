<template>
  <span class="playing-indicator" v-if="isPlaying"></span>
</template>

<script setup>
const props = defineProps({
  isPlaying: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<style scoped>
.playing-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: #4CAF50; /* Green */
  border-radius: 50%;
  margin-left: 8px;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
}
</style> 