<script setup lang="ts">
import { MoreVertical, Edit2, Trash } from "lucide-vue-next";
import type { SSOMappingActionsProps } from "~/components/administration/settings/sso/index";
import ConfirmDialog from "~/components/primitives/ConfirmDialog.vue";

defineProps<SSOMappingActionsProps>();
</script>

<template>
  <UiDropdownMenu>
    <UiDropdownMenuTrigger as-child>
      <UiButton
        variant="ghost"
        size="icon-sm"
      >
        <MoreVertical />
      </UiButton>
    </UiDropdownMenuTrigger>
    <UiDropdownMenuContent align="end">
      <UiDropdownMenuItem>
        <Edit2 />
        {{ $t("settings.sso.actions.edit") }}
      </UiDropdownMenuItem>
      <UiDropdownMenuItem
        variant="destructive"
        @click="() => {
          console.log(entry.key);
          deleteEntry(entry.key);
        }"
      >
        <Trash />
        {{ $t("settings.sso.actions.delete") }}
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
