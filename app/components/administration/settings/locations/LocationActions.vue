<script setup lang="ts">
import { MoreVertical, Edit2, Trash } from "lucide-vue-next";
import type { LocationActionsProps } from "~/components/administration/settings/locations/index";
import ConfirmDialog from "~/components/primitives/ConfirmDialog.vue";
import LocationEditDialog from "~/components/administration/settings/locations/LocationEditDialog.vue";

defineProps<LocationActionsProps>();

const store = useCompanyStore();

const editOpen = ref<boolean>(false);
const deleteOpen = ref<boolean>(false);
</script>

<template>
  <div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          variant="ghost"
          size="icon"
        >
          <MoreVertical />
        </UiButton>
      </UiDropdownMenuTrigger>
      <UiDropdownMenuContent>
        <UiDropdownMenuGroup>
          <UiDropdownMenuItem @click="editOpen = true">
            <Edit2 />
            {{ $t("settings.locations.table.actions.edit") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>

        <UiDropdownMenuSeparator />

        <UiDropdownMenuGroup>
          <UiDropdownMenuItem
            variant="destructive"
            @click="deleteOpen = true"
          >
            <Trash />
            {{ $t("settings.locations.table.actions.delete") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <LocationEditDialog
      v-model:open="editOpen"
      :location
    />
    <ConfirmDialog
      v-model:open="deleteOpen"
      title-key="settings.locations.dialog.delete-confirm.title"
      description-key="settings.locations.dialog.delete-confirm.description"
      action-key="settings.locations.dialog.delete-confirm.action"
      @confirm="store.deleteLocation(location.id)"
    />
  </div>
</template>
