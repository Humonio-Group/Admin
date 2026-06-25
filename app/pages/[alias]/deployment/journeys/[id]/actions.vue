<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { columns } from "~/components/deployment/journeys/actions";
import { Zap } from "@lucide/vue";

const store = useJourneyStore();
const { journey, loading } = storeToRefs(store);

store.loadActions();
</script>

<template>
  <PageRoot
    name="journeys.specimen.actions"
    class="p-4"
  >
    <template v-if="journey?.actions">
      <div
        v-if="loading.actions && journey.actions.totalEntities === -1"
        class="h-24 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <UiDataTable
        v-else-if="journey.actions.list.length"
        :columns="columns()"
        :data="journey.actions.list"
      />
      <UiEmpty v-else>
        <UiEmptyHeader>
          <UiEmptyMedia variant="icon">
            <Zap />
          </UiEmptyMedia>
          <UiEmptyTitle>{{ $t("deployment.journeys.actions.empty.title") }}</UiEmptyTitle>
          <UiEmptyDescription>{{ $t("deployment.journeys.actions.empty.description") }}</UiEmptyDescription>
        </UiEmptyHeader>
      </UiEmpty>
    </template>
  </PageRoot>
</template>
