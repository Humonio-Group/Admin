<script setup lang="ts">
import type { ConditionEditDialogProps } from "./";

const props = defineProps<ConditionEditDialogProps>();

const open = defineModel<boolean>("open", { default: false });
const editMode = computed(() => !!props.term);
</script>

<template>
  <UiDialog v-model:open="open">
    <UiDialogTrigger
      v-if="trigger"
      as-child
    >
      <slot />
    </UiDialogTrigger>

    <UiDialogContent>
      Content todo {{ editMode ? "edit" : "new" }}
    </UiDialogContent>
  </UiDialog>
</template>
