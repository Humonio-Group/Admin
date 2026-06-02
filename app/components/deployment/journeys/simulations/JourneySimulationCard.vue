<script setup lang="ts">
import type { JourneySimulationCardProps } from "~/components/deployment/journeys/simulations/index";
import JourneySimulationActions from "~/components/deployment/journeys/simulations/JourneySimulationActions.vue";

defineProps<JourneySimulationCardProps>();
</script>

<template>
  <UiCard
    class="shrink-0 w-full max-w-64"
    :class="{ 'pt-0': simulation.icon }"
  >
    <NuxtImg
      v-if="simulation.icon"
      :src="simulation.icon"
      class="aspect-video rounded-t-lg object-cover bg-primary"
    />

    <UiCardHeader class="flex flex-row items-center justify-between">
      <UiCardTitle>{{ simulation.name }} <span class="text-xs font-normal text-muted-foreground">(v{{ simulation.version.value }})</span></UiCardTitle>

      <JourneySimulationActions :simulation />
    </UiCardHeader>
  </UiCard>
</template>

<style scoped>

</style>
