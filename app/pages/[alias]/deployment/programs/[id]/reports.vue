<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";

const { t } = useI18n();
useBreadcrumb([
  { label: t("deployment.programs.title"), to: "/deployment/programs" },
  { label: `${useRoute().params.id}`, to: `/deployment/programs/${useRoute().params.id}` },
  { label: t("deployment.programs.navigation.reports") },
]);
</script>

<template>
  <PageRoot name="deployment.programs.details.reports">
    REPORTS
  </PageRoot>
</template>
