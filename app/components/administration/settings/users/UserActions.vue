<script setup lang="ts">
import { Edit2, MoreVertical, RectangleEllipsis, Trash } from "lucide-vue-next";
import type { UserActionsProps } from "~/components/administration/settings/users/index";
import UserDialog from "~/components/administration/settings/users/UserDialog.vue";
import ConfirmDialog from "~/components/primitives/ConfirmDialog.vue";

defineProps<UserActionsProps>();

const store = useCompanyStore();

const dialog = ref<boolean>(false);
const destroy = ref<boolean>(false);
</script>

<template>
  <div>
    <UiDropdownMenu>
      <UiDropdownMenuTrigger as-child>
        <UiButton
          size="icon-sm"
          variant="ghost"
        >
          <MoreVertical />
        </UiButton>
      </UiDropdownMenuTrigger>

      <UiDropdownMenuContent align="end">
        <UiDropdownMenuGroup>
          <UiDropdownMenuItem @click="dialog = true">
            <Edit2 />
            {{ $t("settings.users.table.actions.edit") }}
          </UiDropdownMenuItem>
          <UiDropdownMenuItem @click="store.sendNewPasswordEmail(user.id, user.email)">
            <RectangleEllipsis />
            {{ $t("settings.users.table.actions.send-new-password") }}
          </UiDropdownMenuItem>
        </UiDropdownMenuGroup>
      </UiDropdownMenuContent>
    </UiDropdownMenu>

    <UserDialog
      v-model:open="dialog"
      :user
    />
    <ConfirmDialog
      v-model:open="destroy"
      title-key="dialogs.delete-user.title"
      description-key="dialogs.delete-user.description"
      action-key="dialogs.delete-user.action"
      @confirm="store.deleteUser(user.id)"
    />
  </div>
</template>
