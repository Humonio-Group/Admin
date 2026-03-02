<script setup lang="ts">
interface ConfirmDialogProps {
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
  trigger?: boolean;
}

defineProps<ConfirmDialogProps>();
defineEmits<{
  confirm: [];
}>();

const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <UiAlertDialog v-model:open="open">
    <UiAlertDialogTrigger
      v-if="trigger"
      as-child
    >
      <slot />
    </UiAlertDialogTrigger>
    <UiAlertDialogContent>
      <UiAlertDialogHeader>
        <UiAlertDialogTitle>{{ $t(titleKey) }}</UiAlertDialogTitle>
        <UiAlertDialogDescription>{{ $t(descriptionKey) }}</UiAlertDialogDescription>
      </UiAlertDialogHeader>
      <UiAlertDialogFooter>
        <UiAlertDialogCancel>{{ $t("btn.cancel") }}</UiAlertDialogCancel>
        <UiAlertDialogAction @click="$emit('confirm')">
          {{ $t(actionKey) }}
        </UiAlertDialogAction>
      </UiAlertDialogFooter>
    </UiAlertDialogContent>
  </UiAlertDialog>
</template>
