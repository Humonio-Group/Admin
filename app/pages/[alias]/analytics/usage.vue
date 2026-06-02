<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { AreaChart } from "~/components/charts";

const store = useUsageStore();
const { years, platform, loading } = storeToRefs(store);

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
  store.loadPlatformUsage(val);
}, { immediate: true });

store.loadPlatformUsage();
</script>

<template>
  <PageRoot
    name="analytics.usage"
    class="grid gap-6"
  >
    <header class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">
        Utilisation
      </h1>

      <div class="flex items-center gap-2">
        <UiSpinner v-if="loading.platform" />

        <UiSelect v-model="year">
          <UiSelectTrigger>
            <UiSelectValue />
          </UiSelectTrigger>
          <UiSelectContent>
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

    <main class="max-w-full overflow-hidden">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Utilisateurs par rôle et par mois - {{ year }}</UiCardTitle>
        </UiCardHeader>

        <UiCardContent>
          <AreaChart
            v-if="platform"
            :data="platform"
          />
        </UiCardContent>
      </UiCard>
    </main>
  </PageRoot>
</template>
