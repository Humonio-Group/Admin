<script setup lang="ts">
import { MoreVertical, Trash, Eye, Edit2 } from "lucide-vue-next";
import TermDialog from "~/components/user/settings/terms/TermDialog.vue";
import type { ConditionActionsProps } from "~/components/administration/settings/conditions/index";
import ConditionEditDialog from "~/components/administration/settings/conditions/ConditionEditDialog.vue";
import ConfirmDialog from "~/components/primitives/ConfirmDialog.vue";

defineProps<ConditionActionsProps>();

const detailsOpen = ref<boolean>(false);
const editOpen = ref<boolean>(false);
const deleteOpen = ref<boolean>(false);

function deleteTerm() {}
</script>

<template>
  <div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="outline"
          size="icon"
        >
          <MoreVertical />
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent align="end">
        <UiDropdownMenuGroup>
          <UiDropdownMenuItem @click="detailsOpen = true">
            <Eye />
            {{ $t("settings.conditions.table.actions.overview") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem @click="editOpen = true">
            <Edit2 />
            {{ $t("settings.conditions.table.actions.edit") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
        <UiDropdownMenuSeparator />
        <UiDropdownMenuGroup>
          <UiDropdownMenuItem
            variant="destructive"
            @click="deleteOpen = true"
          >
            <Trash />
            {{ $t("settings.conditions.table.actions.delete") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <TermDialog
      v-model:open="detailsOpen"
      :term="term"
    />
    <ConditionEditDialog
      v-model:open="editOpen"
      :term="term"
    />
    <ConfirmDialog
      v-model:open="deleteOpen"
      title-key="settings.conditions.dialog.delete-confirm.title"
      description-key="settings.conditions.dialog.delete-confirm.description"
      action-key="settings.conditions.dialog.delete-confirm.action"
      @confirm="deleteTerm"
    />
  </div>
</template>
