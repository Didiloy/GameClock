<template>
  <div class="wrapped-container">
    <div class="header">
      <h1>{{ $t("Wrapped.title", { year: new Date().getFullYear() }) }}</h1>
      <p>{{ $t("Wrapped.subtitle") }}</p>
    </div>
    
    <div class="content">
      <!-- Placeholder content - this can be expanded with charts/stats later -->
      <div class="placeholder-stat">
        <i class="pi pi-star" style="font-size: 4rem; color: #ffd700;"></i>
        <h2>Coming Soon</h2>
        <p>Your statistics are being calculated...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.wrapped-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  color: white;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 15px;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #ff0080 0%, #7928ca 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.placeholder-stat {
  text-align: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}
</style>

