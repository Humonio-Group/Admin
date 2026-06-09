<script setup lang="ts">
import { MoreVertical, Edit2, Trash } from "lucide-vue-next";
import type { SSOMappingActionsProps } from "~/components/administration/settings/sso/index";
import AddMappingEntryDialog from "~/components/administration/settings/sso/AddMappingEntryDialog.vue";

defineProps<SSOMappingActionsProps>();

const edit = ref<boolean>(false);
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

    <AddMappingEntryDialog
      v-model:open="edit"
      :entry
      :trigger="false"
      :save="updateEntry"
    />
  </div>
</template>
