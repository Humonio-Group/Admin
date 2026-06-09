<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { columns } from "~/components/deployment/journeys/actions";

const store = useJourneyStore();
const { journey, loading } = storeToRefs(store);

store.loadActions();
</script>

<template>
  <PageRoot
    name="journeys.specimen.actions"
    class="p-4"
  >
    <template v-if="journey">
      <div
        v-if="loading.actions && journey.actions.totalEntities === -1"
        class="h-24 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <UiDataTable
        v-else
        :columns="columns()"
        :data="journey.actions"
      />
    </template>
  </PageRoot>
</template>
