<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";

const { t } = useI18n();
useBreadcrumb([
  { label: t("deployment.programs.title"), to: "/deployment/programs" },
  { label: `${useRoute().params.id}` },
]);
</script>

<template>
  <PageRoot name="deployment.programs.details.overview">
    OVERVIEW
  </PageRoot>
</template>
