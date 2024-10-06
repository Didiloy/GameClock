<template>
  <Card
    class="lc-container"
    :pt="{ root: { style: 'box-shadow: 0px 0px 0px 0px; width: 100%;' },
          body: { style: 'width: 100%;' }
  }"
  >
    <template #title>
      <div class="lc-center" v-if="props.iconName">
        <b><i :class="props.iconName + ' icon'"></i></b>
        <span class="lc-title-p" :title="props.name">{{ props.name }}</span>
      </div>
      <div class="lc-center" v-else-if="props.iconValue">
        <img :src="props.iconValue" class="image-icon"/>
        <span class="lc-title-p" :title="props.name">{{ props.name }}</span>
      </div>
      <div class="lc-center" v-else>
        <span class="lc-title-p" :title="props.name">{{ props.name }}</span>
      </div>
    </template>
    <template #content>
      <div v-html="props.value" class="lc-content"></div>
    </template>
  </Card>
</template>
<script setup>
const props = defineProps([
  "name",
  "value",
  "iconName",
  "backgroundColor",
  "titleColor",
  "iconValue"
]);
const backgroundColor = props.backgroundColor
  ? props.backgroundColor
  : "var(--primary-100)";
</script>
<style scoped>
@font-face {
  font-family: dishcek;
  src: url("../assets/fonts/dishcek/Dishcek.otf");
}

@font-face {
  font-family: peachcake;
  src: url("../assets/fonts/peach_cake/peachcake.otf");
}

.icon {
  font-size: 1.8rem;
}

.lc-container {
  width: 100%;
  height: 100%;
  background-color: v-bind("backgroundColor");
  border-radius: 30px;
  overflow: hidden;
}
.lc-center {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  color: v-bind("props.titleColor");
}

.lc-content {
  font-family: peachcake, serif;
  font-size: 1.5rem;
  white-space: wrap;
  width: 100%;
}

:deep(h2) {
  color: v-bind("props.titleColor");
  font-family: dishcek, serif;
  font-size: 1.8rem;
}

.lc-title-p {
  display: inline-block;
  margin: 0 auto 0 auto;
  padding: 0;
  font-family: dishcek, serif;
  font-size: 2rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.image-icon {
  width: 30px;
  height:30px;
}
</style>
