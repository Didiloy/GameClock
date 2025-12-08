<template>
  <div class="wrapped-banner" @click="$emit('click')">
    <div class="content">
      <i class="pi pi-gift" style="font-size: 2rem; margin-right: 1rem"></i>
      <div class="text">
        <h3>{{ $t("Wrapped.banner_title", { year: new Date().getFullYear() }) }}</h3>
        <p>{{ $t("Wrapped.banner_subtitle") }}</p>
      </div>
      <i class="pi pi-arrow-right" style="font-size: 1.5rem; margin-left: auto"></i>
    </div>
  </div>
</template>

<script setup>
defineEmits(["click"]);
</script>

<style scoped>
.wrapped-banner {
  width: 98%;
  background: linear-gradient(90deg, #3b82f6 0%, #373a6d 100%);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  padding: 1rem;
  margin-top: 10px;
  margin-bottom: 5px;
  transition: transform 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.wrapped-banner:hover {
  transform: scale(1.01);
}

.content {
  display: flex;
  align-items: center;
  justify-content: start;
}

.text h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.text p {
  margin: 0;
  opacity: 0.9;
}
</style>

