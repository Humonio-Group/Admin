<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";

const store = useJourneyStore();
const { journey } = storeToRefs(store);

await store.loadGroups();
</script>

<template>
  <PageRoot
    name="journeys.specimen.participants"
    class="flex flex-col gap-4"
  >
    <main v-if="journey">
      <NuxtPage />
    </main>
  </PageRoot>
</template>
