<script setup lang="ts">
import { MoreVertical } from "lucide-vue-next";
import type { JourneyTeamMemberActionsProps } from "~/components/deployment/journeys/teams/index";

defineProps<JourneyTeamMemberActionsProps>();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger>
      <UiButton
        variant="ghost"
        size="icon-sm"
      >
        <MoreVertical />
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuItem>Item</UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
