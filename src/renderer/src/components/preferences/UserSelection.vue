<template>
    <div class="p-fluid">
      <h3>{{ $t("UserSelection.title") }}</h3>
      <Dropdown
        v-model="selectedUser"
        :options="users"
        optionLabel="name"
        :placeholder="$t('UserSelection.select_user')"
        @change="saveUserSelection"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import Dropdown from "primevue/dropdown";
  import { getPreferences, setPreferences } from "../../preferences/preferences";
  import { getTeams } from "../../database/database";
  import { useI18n } from "vue-i18n";
  
  const i18n = useI18n();
  const users = ref([]);
  const selectedUser = ref(null);
  
  onMounted(async () => {
    users.value = await getTeams();
    const storedUserId = getPreferences("currentUser");
    if (storedUserId) {
      const foundUser = users.value.find(user => user.id === storedUserId);
      if (foundUser) {
        selectedUser.value = foundUser;
      } 
    }
  });
  
  function saveUserSelection() {
    if (selectedUser.value) {
      setPreferences("currentUser", selectedUser.value.id);
    }
  }
  </script>
  
  <style scoped>
  </style>