<script setup lang="ts">
import { Edit2 } from "lucide-vue-next";
import type { UserActionsProps } from "~/components/administration/settings/users/index";
import UserDialog from "~/components/administration/settings/users/UserDialog.vue";

defineProps<UserActionsProps>();
</script>

<template>
  <UserDialog
    :user="user"
    trigger
    tooltip="settings.users.table.actions.edit"
  >
    <UiButton
      variant="ghost"
      size="icon"
    >
      <Edit2 />
    </UiButton>
  </UserDialog>
</template>
