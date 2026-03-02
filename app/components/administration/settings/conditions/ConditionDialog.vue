<script setup lang="ts">
import type { ConditionDialogProps } from "./";

const props = defineProps<ConditionDialogProps>();

const open = defineModel<boolean>("open", { default: false });
const editMode = computed(() => !!props.term);
</script>

<template>
  <UiDialog>
    <UiDialogTrigger as-child>
      <slot />
    </UiDialogTrigger>

    <UiDialogContent>
      Content todo
    </UiDialogContent>
  </UiDialog>
</template>
