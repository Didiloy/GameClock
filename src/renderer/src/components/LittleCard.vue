<template>
  <Card class="lc-container" :pt="{ root: { style: 'box-shadow: 0px 0px 0px 0px;' } }">
    <template #title>
      <div class="lc-center">
        <b><i :class="props.iconName"></i></b>
        <div class="lc-title">
          {{ props.name }}
        </div>
      </div>
    </template>
    <template #content>
      <div v-html="props.value" class="lc-content">
      </div>
    </template>
  </Card>
</template>
<script setup>
const props = defineProps(["name", "value", "iconName", "backgroundColor", "titleColor"]);
const backgroundColor = props.backgroundColor ? props.backgroundColor : "var(--primary-100)";
</script>
<style scoped>
@font-face {
  font-family: dishcek;
  src: url('../assets/fonts/dishcek/Dishcek.otf');
}

@font-face {
  font-family: peachcake;
  src: url('../assets/fonts/peach_cake/peachcake.otf');
}

.lc-container {
  width: 100%;
  height: 100%;
  background-color: v-bind('backgroundColor');
  border-radius: 30px;
}
.lc-center {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  color: v-bind('props.titleColor');
}

.lc-content {
  font-family: peachcake,serif;
  font-size: 1.5rem;
}

:deep(h2) {
  color: v-bind('props.titleColor');
  font-family: dishcek,serif;
  font-size: 1.8rem;
}
.lc-title {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  font-family: dishcek,serif;
  font-size: 2.0rem;
}
</style>
