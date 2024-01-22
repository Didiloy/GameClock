<template>
  <div class="container">
    <h2>Statistiques générales</h2>
    <Card class="card">
      <template #content>
        <Accordion class="">
          <AccordionTab header="Tous les jeux">
            <GameList />
          </AccordionTab>
        </Accordion>
      </template>
    </Card>
  </div>
</template>

<script setup>
import GameList from "../components/GameList.vue";
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.card {
  background-color: var(--primary-100);
  width: 70vw;
}
</style>
