<template>
  <div class="nvd-container">
    <img src="../assets/images/parachut.png" class="nvd-image" />
    <h2>{{ $t("NewVersionDialog.title") }}</h2>
    <div v-html="changelogToHtml" class="changelog"></div>
    <Button
      icon="pi pi-download"
      class="nvd-button"
      @click="openInBrowser"
      :label="i18n.t('NewVersionDialog.download')"
    />
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { getLatestReleaseChangelog } from "../common/new_version";
import { useI18n } from "vue-i18n";
import markdownit from "markdown-it";
import { computed } from "vue";
import { getPreferences } from "../preferences/preferences";
const md = markdownit();
const i18n = useI18n();
const LATEST_VERSION_URL =
  "https://github.com/Didiloy/GameClock/releases/latest";

const changelog = ref("");
const changelogToHtml = computed(() => md.render(changelog.value));

onMounted(async () => {
  changelog.value = await getLatestReleaseChangelog();
});

function openInBrowser() {
  window.open(LATEST_VERSION_URL);
  if (getPreferences("close_app_when_clicking_on_update")) {
    setTimeout(() => {
      window.electron.ipcRenderer.send("close", {});
    }, 1500);
  }
}
</script>
<style scoped>
.nvd-container {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
}

.nvd-image {
  width: auto;
  height: 150px;
}

h2 {
  color: #5a5d9d;
}

.changelog {
  width: 80%;
  text-align: left;
}

.nvd-button {
  margin: 10px;
}
</style>
