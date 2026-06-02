<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";

const store = useUsageStore();
const { years, loading } = storeToRefs(store);
const { company } = storeToRefs(useCompanyStore());

const yearParam = computed(() => {
  const param = useRoute().query.year;
  if (!param?.length) return new Date().getUTCFullYear();
  return Number(param);
});
const year = ref<number>(yearParam.value);
watch(year, (val) => {
  if (!val) return;
  navigateTo({
    query: {
      year: val,
    },
    replace: true,
  });
}, { immediate: true });

provide("year", year);
</script>

<template>
  <PageRoot
    name="analytics.ai"
    class="grid gap-6"
  >
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        Utilisation IA
      </h1>

      <div class="flex items-center gap-3">
        <UiSpinner v-if="loading.ai" />
        <UiButtonGroup>
          <UiButton
            variant="outline"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/analytics/ai/text`"
              active-class="bg-secondary! text-secondary-foreground!"
            >
              {{ $t("analytics.ai.navigation.text") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            variant="outline"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/analytics/ai/audio`"
              active-class="bg-secondary! text-secondary-foreground!"
            >
              {{ $t("analytics.ai.navigation.audio") }}
            </NuxtLinkLocale>
          </UiButton>
          <UiButton
            variant="outline"
            as-child
          >
            <NuxtLinkLocale
              :to="`/${company?.alias}/analytics/ai/video`"
              active-class="bg-secondary! text-secondary-foreground!"
            >
              {{ $t("analytics.ai.navigation.video") }}
            </NuxtLinkLocale>
          </UiButton>
        </UiButtonGroup>
        <UiSelect v-model="year">
          <UiSelectTrigger>
            <UiSelectValue />
          </UiSelectTrigger>

          <UiSelectContent align="end">
            <UiSelectItem
              v-for="y in years"
              :key="y"
              :value="y"
            >
              {{ y }}
            </UiSelectItem>
          </UiSelectContent>
        </UiSelect>
      </div>
    </header>

    <main>
      <NuxtPage />
    </main>
  </PageRoot>
</template>
