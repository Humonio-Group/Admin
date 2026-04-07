<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";

const { t } = useI18n();

const store = useJourneyStore();
const { journey } = storeToRefs(store);
useBreadcrumb([
  { label: t("deployment.journeys.title"), to: "/deployment/journeys" },
  { label: `${journey.value?.name}` },
]);
</script>

<template>
  <PageRoot name="deployment.journeys.home">
    {{ journey?.name }}
  </PageRoot>
</template>
