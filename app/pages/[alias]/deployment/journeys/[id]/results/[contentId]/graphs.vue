<script setup lang="ts">
import { SquareDashedKanban } from "lucide-vue-next";
import PageRoot from "~/components/composing/PageRoot.vue";
import type { JourneyStageContent } from "~/types/entities/journey";
import { UserRole } from "~/types/entities/user";
import { BarChart, GaugeChart, IndividualChoice, LeaderBoard, PolarChart, ValueChart } from "~/components/charts";
import {
  type BarChartData,
  type GaugeChartData,
  GraphType, type IndividualChoiceChartData, type LeaderBoardChartData,
  type PolarChartData,
  type ValueChartData,
} from "~/types/entities/graph";

const content = inject<Ref<JourneyStageContent>>("content")!;
const graphs = computed(() => content.value.graphs);

const store = useJourneyStore();
const { loading } = storeToRefs(store);

const graphTypes = ["auto", "participant", "facilitator", "coach", "client"] as const;
type GraphRole = typeof graphTypes[number];

const queryRole = computed(() => {
  const queryParam = useRoute().query.role;
  if (!queryParam?.length) return "auto";
  if (!graphTypes.includes(queryParam as GraphRole)) return "auto";
  return queryParam as GraphRole;
});
const selectedRole = ref<GraphRole>(queryRole.value);
watch(selectedRole, (val) => {
  if (!val) return;
  navigateTo({
    query: {
      role: val,
    },
    replace: true,
  });
  store.loadResultContentGraphs(content.value.id, computeRole(val), val === "auto");
}, { immediate: true });

function computeRole(role: GraphRole) {
  switch (role) {
    case "participant": return UserRole.PARTICIPANT;
    case "client": return UserRole.ANALYST;
    case "coach": return UserRole.COACH;
    default: return UserRole.FACILITATOR;
  }
}
</script>

<template>
  <PageRoot
    v-if="content"
    name="deployment.results.content.graphs"
    class="grid gap-3"
  >
    <header class="flex items-center gap-2 py-3">
      <p class="text-muted-foreground">
        {{ $t("deployment.journeys.results.graphs.roles.label") }}
      </p>
      <UiSelect v-model="selectedRole">
        <UiSelectTrigger class="text-base! h-auto! cursor-pointer bg-transparent! border-none p-0">
          <UiSelectValue />
        </UiSelectTrigger>
        <UiSelectContent align="end">
          <UiSelectItem
            v-for="type in graphTypes"
            :key="type"
            :value="type"
          >
            {{ $t(`deployment.journeys.results.graphs.roles.${type}`) }}
          </UiSelectItem>
        </UiSelectContent>
      </UiSelect>
    </header>

    <main class="grid gap-4">
      <div
        v-if="loading.results.graphs"
        class="h-24 grid place-items-center"
      >
        <UiSpinner />
      </div>
      <template v-else-if="graphs.length">
        <UiCard
          v-for="graph in graphs"
          :key="graph.id"
        >
          <UiCardHeader>
            <UiCardTitle>{{ graph.title }}</UiCardTitle>
            <UiCardDescription v-if="graph.description">
              {{ graph.description }}
            </UiCardDescription>
          </UiCardHeader>

          <UiCardContent class="min-h-[40dvh]">
            <BarChart
              v-if="[GraphType.HORIZONTAL_BAR, GraphType.VERTICAL_BAR].includes(graph.type)"
              :orientation="graph.type === GraphType.VERTICAL_BAR ? 'vertical' : 'horizontal'"
              :data="graph.config as BarChartData"
            />
            <PolarChart
              v-else-if="graph.type === GraphType.POLAR"
              :data="graph.config as PolarChartData"
            />
            <GaugeChart
              v-else-if="graph.type === GraphType.GAUGE"
              :data="graph.config as GaugeChartData"
            />
            <ValueChart
              v-else-if="graph.type === GraphType.VALUE"
              :data="graph.config as ValueChartData"
            />
            <IndividualChoice
              v-else-if="graph.type === GraphType.INDIVIDUAL_CHOICE"
              :data="graph.config as IndividualChoiceChartData"
            />
            <LeaderBoard
              v-else-if="graph.type === GraphType.LEADER_BOARD"
              :data="graph.config as LeaderBoardChartData"
            />
          </UiCardContent>
        </UiCard>
      </template>
      <UiEmpty v-else>
        <UiEmptyHeader>
          <UiEmptyMedia variant="icon">
            <SquareDashedKanban />
          </UiEmptyMedia>
          <UiEmptyTitle>{{ $t("deployment.journeys.results.graphs.empty.title") }}</UiEmptyTitle>
          <UiEmptyDescription>{{ $t("deployment.journeys.results.graphs.empty.description") }}</UiEmptyDescription>
        </UiEmptyHeader>

        <UiEmptyContent>
          <UiButton @click="selectedRole = 'auto'">
            {{ $t("deployment.journeys.results.graphs.empty.action") }}
          </UiButton>
        </UiEmptyContent>
      </UiEmpty>
    </main>
  </PageRoot>
</template>
