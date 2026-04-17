<script setup lang="ts">
import { Star, StarHalf } from "lucide-vue-next";
import type { JourneyStatCardProps } from "~/components/deployment/journeys/index";

const props = defineProps<JourneyStatCardProps>();

const normalized = computed(() => props.value * (5 / props.max));
const full = computed(() => Math.floor(normalized.value));
const rest = computed(() => normalized.value - full.value);
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-4 @lg/layout:py-0 @lg/layout:px-4">
    <p class="text-sm font-medium text-muted-foreground">
      {{ label }}
    </p>
    <p class="text-5xl font-extrabold">
      {{ value }} / {{ max }}
    </p>
    <div class="flex items-center">
      <div
        v-for="i in 5"
        :key="i"
        class="relative"
      >
        <Star
          class="size-4.5"
          :class="{ 'fill-primary stroke-primary': i <= full }"
        />
        <StarHalf
          v-if="rest && i === full + 1"
          class="absolute top-0 left-0 size-4.5 fill-primary stroke-primary"
        />
      </div>
    </div>
  </div>
</template>
