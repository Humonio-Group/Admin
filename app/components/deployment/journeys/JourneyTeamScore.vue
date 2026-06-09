<script setup lang="ts">
import type { JourneyTeamScoreProps } from "~/components/deployment/journeys/index";

const props = defineProps<JourneyTeamScoreProps>();

const progress = computed(() => {
  if (props.score.percent) return Math.round(props.score.value);
  return props.score.min === props.score.max
    ? props.score.max
    : Math.round(((props.score.value - props.score.min) / (props.score.max - props.score.min)) * 100);
});
</script>

<template>
  <div class="grid gap-1.5">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">
        {{ score.label }}
      </p>
      <p class="text-sm font-medium text-primary">
        {{ progress }}%
      </p>
    </div>
    <UiProgress :model-value="progress" />
  </div>
</template>
