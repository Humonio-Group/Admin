<script setup lang="ts">
import PageRoot from "~/components/composing/PageRoot.vue";
import { AreaChart } from "~/components/charts";

const store = useUsageStore();
const { ai } = storeToRefs(store);

const { format, separate } = useNumberFormat();

const year = inject<Ref<number>>("year")!;
watch(year, (val) => {
  if (!val) return;
  navigateTo({
    query: {
      year: year.value,
    },
    replace: true,
  });
  store.loadAiUsage("text", val);
}, { immediate: true });

const totalTokens = computed(() => ai.value?.graph.series[0]!.data.reduce((acc, curr) => {
  acc += curr;
  return acc;
}, 0) ?? 0);
</script>

<template>
  <PageRoot
    name="analytics.ai.text"
    class="grid gap-6 max-w-full overflow-hidden"
  >
    <header
      v-if="ai"
      class="grid grid-cols-3 gap-6"
    >
      <UiCard>
        <UiCardContent class="grid gap-1.5">
          <p class="text-sm font-medium text-muted-foreground">
            {{ $t("analytics.ai.stats.simulations") }}
          </p>
          <p class="text-3xl font-bold">
            {{ ai.simulations }}
          </p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="grid gap-1.5">
          <p class="text-sm font-medium text-muted-foreground">
            {{ $t("analytics.ai.stats.tokens-remaining") }}
          </p>
          <p class="text-3xl font-bold">
            {{ format(ai.remaining.tokens ?? 0) }}
          </p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="grid gap-1.5">
          <p class="text-sm font-medium text-muted-foreground">
            {{ $t("analytics.ai.stats.tokens-available") }}
          </p>
          <p class="text-3xl font-bold">
            {{ format(ai.available.tokens ?? 0) }}
          </p>
        </UiCardContent>
      </UiCard>
    </header>

    <UiCard>
      <UiCardHeader>
        <UiCardTitle>{{ $t("analytics.ai.graph.title", { year }) }}</UiCardTitle>
        <UiCardDescription>{{ $t("analytics.ai.graph.text", { count: separate(totalTokens) }) }}</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <AreaChart
          v-if="ai"
          :data="ai.graph"
        />
      </UiCardContent>
    </UiCard>
  </PageRoot>
</template>
