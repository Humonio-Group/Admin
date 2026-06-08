<script setup lang="ts">
import { MoreVertical, ToggleLeft, ToggleRight, Edit2, Link2Off } from "lucide-vue-next";
import type { CompanyActionsProps } from "~/components/administration/settings/companies/index";
import CompanyDialog from "~/components/administration/settings/companies/CompanyDialog.vue";
import ConfirmDialog from "~/components/primitives/ConfirmDialog.vue";

defineProps<CompanyActionsProps>();

const store = useCompanyStore();

const edit = ref<boolean>(false);
const detach = ref<boolean>(false);
</script>

<template>
  <div>
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
        <UiDropdownMenuItem @click="edit = true">
          <Edit2 />
          {{ $t("settings.companies.table.actions.edit") }}
        </UiDropdownMenuItem>

        <UiDropdownMenuItem @click="detach = true">
          <Link2Off />
          {{ $t("settings.companies.table.actions.detach") }}
        </UiDropdownMenuItem>

        <UiDropdownMenuItem
          v-if="company.active"
          variant="destructive"
          @click="store.disableCompany(company.id)"
        >
          <ToggleLeft />
          {{ $t("settings.companies.table.actions.disable") }}
        </UiDropdownMenuItem>
        <UiDropdownMenuItem
          v-else
          @click="store.enableCompany(company.id)"
        >
          <ToggleRight />
          {{ $t("settings.companies.table.actions.enable") }}
        </UiDropdownMenuItem>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <CompanyDialog
      v-model:open="edit"
      :company
    />
    <ConfirmDialog
      v-model:open="detach"
      title-key="dialogs.detach-company.title"
      description-key="dialogs.detach-company.description"
      action-key="dialogs.detach-company.action"
      @confirm="store.detachCompany(company.id)"
    />
  </div>
</template>
