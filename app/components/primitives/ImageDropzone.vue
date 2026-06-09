<script setup lang="ts">
import { Upload, X, ImageIcon } from "lucide-vue-next";
import type { HTMLAttributes } from "vue";
import { cn } from "~/lib/utils";

const props = withDefaults(
  defineProps<{
    aspectRatio?: number;
    accept?: string;
    maxSize?: number;
    class?: HTMLAttributes["class"];
  }>(),
  {
    accept: "image/png, image/jpeg, image/gif, image/webp",
    maxSize: 5 * 1024 * 1024,
  },
);

const emit = defineEmits<{
  crop: [blob: Blob];
  clear: [];
}>();

const preview = defineModel<string | undefined>("preview");

const inputId = useId();
const dragging = ref(false);
const cropDialogOpen = ref(false);
const cropSrc = ref<string>();
const cropMimeType = ref<string>();

function processFile(file: File) {
  if (!file.type.startsWith("image/")) return;
  if (props.maxSize && file.size > props.maxSize) return;

  cropSrc.value = URL.createObjectURL(file);
  cropMimeType.value = file.type;
  cropDialogOpen.value = true;
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
  (event.target as HTMLInputElement).value = "";
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

function onCrop(blob: Blob) {
  cleanup();
  preview.value = URL.createObjectURL(blob);
  emit("crop", blob);
}

function onCropDialogChange(value: boolean) {
  if (!value) cleanup();
}

function cleanup() {
  if (cropSrc.value) URL.revokeObjectURL(cropSrc.value);
  cropSrc.value = undefined;
  cropMimeType.value = undefined;
}

function removePreview() {
  if (preview.value) URL.revokeObjectURL(preview.value);
  preview.value = undefined;
  emit("clear");
}
</script>

<template>
  <div :class="cn('relative', props.class)">
    <!-- Preview -->
    <div
      v-if="preview"
      class="h-full group relative"
    >
      <img
        :src="preview"
        alt="Preview"
        class="size-full rounded-md border object-cover"
      >
      <button
        type="button"
        class="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
        @click="removePreview"
      >
        <X class="size-3" />
      </button>
    </div>

    <!-- Dropzone -->
    <label
      v-else
      :for="inputId"
      class="flex h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed transition-colors"
      :class="dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <component
        :is="dragging ? Upload : ImageIcon"
        class="size-6 text-muted-foreground"
      />
      <span class="text-xs text-muted-foreground">{{ $t("primitives.image-dropzone.label") }}</span>

      <input
        :id="inputId"
        type="file"
        :accept="props.accept"
        class="hidden"
        @change="onFileChange"
      >
    </label>

    <!-- Crop dialog -->
    <PrimitivesImageCropDialog
      v-if="cropSrc"
      v-model:open="cropDialogOpen"
      :src="cropSrc"
      :mime-type="cropMimeType"
      :aspect-ratio="props.aspectRatio"
      @crop="onCrop"
      @update:open="onCropDialogChange"
    />
  </div>
</template>
