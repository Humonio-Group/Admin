<script setup lang="ts">
import type { ActionStatusBadgeProps } from "~/components/deployment/journeys/actions/index";

defineProps<ActionStatusBadgeProps>();
</script>

<template>
  <UiBadge
    v-if="action.status === -2"
    variant="destructive"
  >
    {{ $t("deployment.journeys.actions.table.status.late") }}
  </UiBadge>
  <UiBadge
    v-else-if="action.status === 0"
    variant="outline"
  >
    {{ $t("deployment.journeys.actions.table.status.on-track") }}
  </UiBadge>
  <UiBadge v-else-if="action.status === 1">
    {{ $t("deployment.journeys.actions.table.status.terminated") }}
  </UiBadge>
</template>
