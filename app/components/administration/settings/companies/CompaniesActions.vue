<script setup lang="ts">
import { MoreVertical, ToggleLeft, ToggleRight, Edit2, Link2Off } from "lucide-vue-next";
import type { CompanyActionsProps } from "~/components/administration/settings/companies/index";

defineProps<CompanyActionsProps>();
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
        {{ $t("settings.companies.table.actions.edit") }}
      </UiDropdownMenuItem>
      <UiDropdownMenuItem>
        <Link2Off />
        {{ $t("settings.companies.table.actions.detach") }}
      </UiDropdownMenuItem>
      <UiDropdownMenuItem
        v-if="company.active"
        variant="destructive"
      >
        <ToggleLeft />
        {{ $t("settings.companies.table.actions.disable") }}
      </UiDropdownMenuItem>
      <UiDropdownMenuItem v-else>
        <ToggleRight />
        {{ $t("settings.companies.table.actions.disable") }}
      </UiDropdownMenuItem>
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
